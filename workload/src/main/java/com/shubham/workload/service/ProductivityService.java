package com.shubham.workload.service;

import com.shubham.workload.model.Task;
import com.shubham.workload.repository.EmployeeRepository;
import com.shubham.workload.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductivityService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;

    // ─── Get Employee Productivity ─────────────────────────────────────────────

    public Map<String, Object> getProductivity(Long employeeId) {
        log.info("Calculating productivity for employee id: {}", employeeId);

        // ── Step 1: Validate Employee ──────────────────────────────────────────
        if (!employeeRepository.existsById(employeeId)) {
            throw new RuntimeException("Employee not found with id: " + employeeId);
        }

        // ── Step 2: Get All Tasks of Employee ──────────────────────────────────
        List<Task> allTasks = taskRepository.findByAssignedToId(employeeId);

        // ── Step 3: Count Total Tasks ──────────────────────────────────────────
        int totalTasks = allTasks.size();

        // ── Step 4: Count Completed Tasks (DONE) ──────────────────────────────
        long completedTasks = allTasks.stream()
                .filter(task -> task.getStatus() == Task.Status.DONE)
                .count();

        // ── Step 5: Calculate Productivity Percentage ─────────────────────────
        double productivityPercentage = (totalTasks > 0)
                ? Math.round(((double) completedTasks / totalTasks) * 100.0 * 100.0) / 100.0
                : 0.0;

        // ── Step 6: Determine Productivity Rating ─────────────────────────────
        String productivityRating;
        if (productivityPercentage >= 80.0) {
            productivityRating = "EXCELLENT";
        } else if (productivityPercentage >= 60.0) {
            productivityRating = "GOOD";
        } else if (productivityPercentage >= 40.0) {
            productivityRating = "AVERAGE";
        } else if (productivityPercentage >= 20.0) {
            productivityRating = "BELOW_AVERAGE";
        } else {
            productivityRating = "POOR";
        }

        log.info("Productivity result for employee {}: total={}, completed={}, percentage={}%",
                employeeId, totalTasks, completedTasks, productivityPercentage);

        // ── Step 7: Build and Return Response ─────────────────────────────────
        Map<String, Object> response = new HashMap<>();
        response.put("employeeId",             employeeId);
        response.put("totalTasks",             totalTasks);
        response.put("completedTasks",         completedTasks);
        response.put("pendingTasks",           totalTasks - completedTasks);
        response.put("productivityPercentage", productivityPercentage);
        response.put("productivityRating",     productivityRating);

        return response;
    }
}