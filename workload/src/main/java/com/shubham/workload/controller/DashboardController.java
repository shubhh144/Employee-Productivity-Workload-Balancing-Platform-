package com.shubham.workload.controller;

import com.shubham.workload.service.DashboardService;
import com.shubham.workload.repository.TaskRepository;
import com.shubham.workload.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService   dashboardService;
    private final EmployeeRepository employeeRepository;
    private final TaskRepository     taskRepository;

    // ─── GET /dashboard/{employeeId} ───────────────────────────────────────────

    @GetMapping("/{employeeId}")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @PathVariable Long employeeId) {
        log.info("REST request to fetch dashboard for id: {}", employeeId);

        Map<String, Object> dashboardData =
                dashboardService.getDashboard(employeeId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dashboard fetched successfully");
        response.put("data",    dashboardData);

        return ResponseEntity.ok(response);
    }

    // ─── GET /dashboard/admin ──────────────────────────────────────────────────

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        log.info("REST request to fetch admin dashboard");

        // ── Total Employees ────────────────────────────────────────────────────
        long totalEmployees = employeeRepository.count();

        // ── Total Tasks ────────────────────────────────────────────────────────
        long totalTasks = taskRepository.count();

        // ── Tasks by Status ────────────────────────────────────────────────────
        long todoCount       = taskRepository.countByStatus(
                com.shubham.workload.model.Task.Status.TODO);
        long inProgressCount = taskRepository.countByStatus(
                com.shubham.workload.model.Task.Status.IN_PROGRESS);
        long doneCount       = taskRepository.countByStatus(
                com.shubham.workload.model.Task.Status.DONE);
        long blockedCount    = taskRepository.countByStatus(
                com.shubham.workload.model.Task.Status.BLOCKED);

        // ── All Employees with task count ──────────────────────────────────────
        List<Map<String, Object>> employeeList = employeeRepository.findAll()
                .stream()
                .map(emp -> {
                    long taskCount = taskRepository
                            .findByAssignedToId(emp.getId()).size();

                    Map<String, Object> empData = new HashMap<>();
                    empData.put("employeeId", emp.getId());
                    empData.put("name",       emp.getName());
                    empData.put("department", emp.getDepartment());
                    empData.put("capacity",   emp.getCapacity());
                    empData.put("taskCount",  taskCount);
                    return empData;
                })
                .collect(Collectors.toList());

        // ── Build Response ─────────────────────────────────────────────────────
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEmployees", totalEmployees);
        summary.put("totalTasks",     totalTasks);
        summary.put("todoCount",      todoCount);
        summary.put("inProgressCount",inProgressCount);
        summary.put("doneCount",      doneCount);
        summary.put("blockedCount",   blockedCount);

        Map<String, Object> response = new HashMap<>();
        response.put("success",   true);
        response.put("message",   "Admin dashboard fetched successfully");
        response.put("summary",   summary);
        response.put("employees", employeeList);

        return ResponseEntity.ok(response);
    }
}