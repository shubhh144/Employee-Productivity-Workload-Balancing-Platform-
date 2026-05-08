package com.shubham.workload.controller;

import com.shubham.workload.service.DeadlineRiskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class DeadlineRiskController {

    private final DeadlineRiskService deadlineRiskService;

    // ─── GET /tasks/deadline-risk ──────────────────────────────────────────────

    @GetMapping("/deadline-risk")
    public ResponseEntity<Map<String, Object>> getDeadlineRisk() {
        log.info("REST request to fetch deadline risk report");

        List<Map<String, Object>> riskData = deadlineRiskService.getDeadlineRisk();

        // ── Count by Risk Level ────────────────────────────────────────────────
        long criticalCount = riskData.stream()
                .filter(t -> "CRITICAL".equals(t.get("riskLevel"))).count();

        long highCount = riskData.stream()
                .filter(t -> "HIGH".equals(t.get("riskLevel"))).count();

        long lowCount = riskData.stream()
                .filter(t -> "LOW".equals(t.get("riskLevel"))).count();

        // ── Build Response ─────────────────────────────────────────────────────
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalTasksEvaluated", riskData.size());
        summary.put("criticalRiskCount",   criticalCount);
        summary.put("highRiskCount",       highCount);
        summary.put("lowRiskCount",        lowCount);

        Map<String, Object> response = new HashMap<>();
        response.put("success",  true);
        response.put("message",  "Deadline risk report fetched successfully");
        response.put("summary",  summary);
        response.put("tasks",    riskData);

        return ResponseEntity.ok(response);
    }
}
