package com.shubham.workload.controller;

import com.shubham.workload.service.ProductivityService;
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
public class ProductivityController {

    private final ProductivityService productivityService;

    // ─── GET /employee/{id}/productivity ──────────────────────────────────────

    @GetMapping("/{id}/productivity")
    public ResponseEntity<Map<String, Object>> getEmployeeProductivity(@PathVariable Long id) {
        log.info("REST request to fetch productivity for employee id: {}", id);

        Map<String, Object> productivityData = productivityService.getProductivity(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success",                true);
        response.put("employeeId",             id);
        response.put("totalTasks",             productivityData.get("totalTasks"));
        response.put("completedTasks",         productivityData.get("completedTasks"));
        response.put("pendingTasks",           productivityData.get("pendingTasks"));
        response.put("productivityPercentage", productivityData.get("productivityPercentage"));
        response.put("productivityRating",     productivityData.get("productivityRating"));

        return ResponseEntity.ok(response);
    }
}
