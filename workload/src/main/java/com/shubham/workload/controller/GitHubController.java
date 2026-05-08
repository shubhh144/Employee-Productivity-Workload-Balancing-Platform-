package com.shubham.workload.controller;

import com.shubham.workload.model.Task;
import com.shubham.workload.repository.TaskRepository;
import com.shubham.workload.service.GitHubService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/github")
@RequiredArgsConstructor
public class GitHubController {

    private final GitHubService  gitHubService;
    private final TaskRepository taskRepository;

    // ─── GET /github/check/{taskId} ────────────────────────────────────────────

    @GetMapping("/check/{taskId}")
    public ResponseEntity<Map<String, Object>> checkTask(
            @PathVariable Long taskId) {
        log.info("Manual GitHub check for task: {}", taskId);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found: " + taskId));

        Task updated = gitHubService.autoUpdateTaskStatus(task);

        Map<String, Object> response = new HashMap<>();
        response.put("success",   true);
        response.put("taskId",    updated.getId());
        response.put("title",     updated.getTitle());
        response.put("status",    updated.getStatus());
        response.put("repoName",  updated.getRepoName());
        response.put("branch",    updated.getBranchName());

        return ResponseEntity.ok(response);
    }
}