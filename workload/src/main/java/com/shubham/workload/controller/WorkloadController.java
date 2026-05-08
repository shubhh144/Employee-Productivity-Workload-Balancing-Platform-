package com.shubham.workload.controller;

import com.shubham.workload.service.WorkloadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class WorkloadController {

    private final WorkloadService workloadService;

    // ─── GET /employee/{id}/workload ───────────────────────────────────────────

    @GetMapping("/{id}/workload")
    public ResponseEntity<Map<String, Object>> getEmployeeWorkload(@PathVariable Long id) {
        log.info("REST request to fetch workload for employee id: {}", id);

        Map<String, Object> workloadData = workloadService.getEmployeeWorkload(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success",               true);
        response.put("employeeId",            id);
        response.put("totalTasks",            workloadData.get("totalTasks"));
        response.put("totalHours",            workloadData.get("totalHours"));
        response.put("capacity",              workloadData.get("capacity"));
        response.put("utilizationPercentage", workloadData.get("utilizationPercentage"));
        response.put("workloadStatus",        workloadData.get("workloadStatus"));

        return ResponseEntity.ok(response);
    }
}