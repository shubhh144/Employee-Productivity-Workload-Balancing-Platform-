package com.shubham.workload.service;

import com.shubham.workload.model.Task;
import com.shubham.workload.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubService {

    private final TaskRepository taskRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${github.token}")
    private String githubToken;

    @Value("${github.api.url}")
    private String githubApiUrl;

    // ─── Minimum thresholds ────────────────────────────────────────────────────
    private static final int MIN_FILES_CHANGED = 1;
    private static final int MIN_LINES_CHANGED = 1;
    private static final int HOURS_LOOKBACK    = 24;

    // ─── Check Valid Commits ───────────────────────────────────────────────────

    public boolean hasValidCommits(String owner, String repo, String branch) {
        try {
            // ── Step 1: Get recent commits (last 24 hours) ─────────────────────
            String since = Instant.now()
                    .minus(HOURS_LOOKBACK, ChronoUnit.HOURS)
                    .toString();

            String url = githubApiUrl + "/repos/" + owner + "/" + repo
                    + "/commits?sha=" + branch
                    + "&since=" + since
                    + "&per_page=10";

            List<Map<String, Object>> commits = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken)
                    .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (commits == null || commits.isEmpty()) {
                log.info("No recent commits for {}/{} branch {}",
                        owner, repo, branch);
                return false;
            }

            // ── Step 2: Check each commit for real changes ─────────────────────
            for (Map<String, Object> commit : commits) {
                String sha = (String) commit.get("sha");

                if (isValidCommit(owner, repo, sha)) {
                    log.info("Valid commit found: {} in {}/{}",
                            sha.substring(0, 7), owner, repo);
                    return true;
                }
            }

            log.info("No valid commits found — possible fake commits");
            return false;

        } catch (Exception e) {
            log.error("Error checking commits: {}", e.getMessage());
            return false;
        }
    }

    // ─── Validate Single Commit ────────────────────────────────────────────────

    private boolean isValidCommit(String owner, String repo, String sha) {
        try {
            String url = githubApiUrl + "/repos/" + owner + "/" + repo
                    + "/commits/" + sha;

            Map<String, Object> commitDetail = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken)
                    .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (commitDetail == null) return false;

            // ── Check files changed ────────────────────────────────────────────
            List<Map<String, Object>> files =
                    (List<Map<String, Object>>) commitDetail.get("files");

            if (files == null || files.size() < MIN_FILES_CHANGED) {
                log.info("Commit {} has {} files — below minimum {}",
                        sha.substring(0, 7), files == null ? 0 : files.size(),
                        MIN_FILES_CHANGED);
                return false;
            }

            // ── Check lines changed ────────────────────────────────────────────
            Map<String, Object> stats =
                    (Map<String, Object>) commitDetail.get("stats");

            if (stats != null) {
                int additions = (int) stats.getOrDefault("additions", 0);
                int deletions = (int) stats.getOrDefault("deletions", 0);
                int total     = additions + deletions;

                if (total < MIN_LINES_CHANGED) {
                    log.info("Commit {} has {} lines changed — below minimum {}",
                            sha.substring(0, 7), total, MIN_LINES_CHANGED);
                    return false;
                }

                log.info("Commit {} valid: {} files, {} lines changed",
                        sha.substring(0, 7), files.size(), total);
            }

            return true;

        } catch (Exception e) {
            log.error("Error validating commit {}: {}", sha, e.getMessage());
            return false;
        }
    }

    // ─── Check Open PRs ────────────────────────────────────────────────────────

    public boolean hasOpenPR(String owner, String repo, String branch) {
        try {
            String url = githubApiUrl + "/repos/" + owner + "/" + repo
                    + "/pulls?state=open&head=" + owner + ":" + branch;

            List<?> prs = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken)
                    .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            return prs != null && !prs.isEmpty();

        } catch (Exception e) {
            log.error("Error checking PRs: {}", e.getMessage());
            return false;
        }
    }

    // ─── Check Merged PRs ─────────────────────────────────────────────────────

    public boolean hasMergedPR(String owner, String repo, String branch) {
        try {
            String url = githubApiUrl + "/repos/" + owner + "/" + repo
                    + "/pulls?state=closed&head=" + owner + ":" + branch;

            List<Map<String, Object>> prs = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken)
                    .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (prs == null || prs.isEmpty()) return false;

            return prs.stream()
                    .anyMatch(pr -> pr.get("merged_at") != null);

        } catch (Exception e) {
            log.error("Error checking merged PRs: {}", e.getMessage());
            return false;
        }
    }

    // ─── Auto Update Task Status ───────────────────────────────────────────────

    public Task autoUpdateTaskStatus(Task task) {
        if (task.getRepoName()       == null ||
            task.getBranchName()     == null ||
            task.getGithubUsername() == null) {
            log.warn("Task {} has no GitHub info — skipping", task.getId());
            return task;
        }

        if (task.getStatus() == Task.Status.DONE) {
            log.info("Task {} already DONE — skipping", task.getId());
            return task;
        }

        String owner  = task.getGithubUsername();
        String repo   = task.getRepoName();
        String branch = task.getBranchName();

        Task.Status newStatus = task.getStatus();

        // ── Priority: Merged > Open PR > Valid Commits ────────────────────────
        if (hasMergedPR(owner, repo, branch)) {
            newStatus = Task.Status.DONE;
        } else if (hasOpenPR(owner, repo, branch)) {
            newStatus = Task.Status.REVIEW;
        } else if (hasValidCommits(owner, repo, branch)) {
            newStatus = Task.Status.IN_PROGRESS;
        }

        if (newStatus != task.getStatus()) {
            log.info("Task {} status: {} → {}",
                    task.getId(), task.getStatus(), newStatus);
            task.setStatus(newStatus);
            return taskRepository.save(task);
        }

        return task;
    }
}