package com.shubham.workload.controller;

import com.shubham.workload.model.Task;
import com.shubham.workload.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // ─── GET /task/all ─────────────────────────────────────────────────────────
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllTasks() {
        log.info("REST request to get all tasks");

        List<Task> tasks = taskService.getAllTasks();

        Map<String, Object> response = new HashMap<>();
        response.put("success",    true);
        response.put("totalTasks", tasks.size());
        response.put("data",       tasks);

        return ResponseEntity.ok(response);
    }

    // ─── POST /task/create ─────────────────────────────────────────────────────
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createTask(
            @RequestBody Task task) {
        log.info("REST request to create task: {}", task.getTitle());

        try {
            Task created = taskService.createTask(task);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Task created successfully");
            response.put("data",    created);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // ─── POST /task/assign ─────────────────────────────────────────────────────
    @PostMapping("/assign")
    public ResponseEntity<Map<String, Object>> assignTaskToEmployee(
            @RequestParam Long taskId,
            @RequestParam Long employeeId) {
        log.info("REST request to assign task {} to employee {}",
                taskId, employeeId);

        try {
            Task assigned = taskService.assignTaskToEmployee(taskId, employeeId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Task assigned successfully");
            response.put("data",    assigned);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // ─── PUT /task/{taskId}/github-details ────────────────────────────────────
    @PutMapping("/{taskId}/github-details")
    public ResponseEntity<Map<String, Object>> updateGithubDetails(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> request) {
        log.info("REST request to update GitHub details for task: {}", taskId);

        try {
            Task task = taskService.getTaskById(taskId);

            task.setGithubUsername(request.get("githubUsername"));
            task.setRepoName(request.get("repoName"));
            task.setBranchName(request.get("branchName"));

            Task updated = taskService.saveTask(task);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "GitHub details updated successfully");
            response.put("data",    updated);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}