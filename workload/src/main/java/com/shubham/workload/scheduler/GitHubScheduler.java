package com.shubham.workload.scheduler;

import com.shubham.workload.model.Task;
import com.shubham.workload.repository.TaskRepository;
import com.shubham.workload.service.GitHubService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GitHubScheduler {

    private final TaskRepository taskRepository;
    private final GitHubService  gitHubService;

    // ─── Runs every 5 minutes ──────────────────────────────────────────────────

    @Scheduled(fixedRate = 30000) // 5 min = 300000 ms
    public void checkGitHubActivity() {
        log.info("=== GitHub Scheduler Started ===");

        List<Task> activeTasks = taskRepository.findAll()
                .stream()
                .filter(t -> t.getStatus() != Task.Status.DONE)
                .filter(t -> t.getRepoName() != null)
                .toList();

        log.info("Active tasks with GitHub info: {}", activeTasks.size());

        for (Task task : activeTasks) {
            try {
                gitHubService.autoUpdateTaskStatus(task);
            } catch (Exception e) {
                log.error("Error processing task {}: {}",
                        task.getId(), e.getMessage());
            }
        }

        log.info("=== GitHub Scheduler Completed ===");
    }
}