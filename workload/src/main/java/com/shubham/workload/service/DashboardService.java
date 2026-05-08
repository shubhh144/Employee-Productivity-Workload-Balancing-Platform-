package com.shubham.workload.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WorkloadService      workloadService;
    private final ProductivityService  productivityService;
    private final DeadlineRiskService  deadlineRiskService;

    // ─── Get Full Dashboard for Employee ──────────────────────────────────────

    public Map<String, Object> getDashboard(Long employeeId) {
        log.info("Building dashboard for employee id: {}", employeeId);

        // ── Step 1: Fetch Workload Data ────────────────────────────────────────
        Map<String, Object> workloadData = workloadService.getEmployeeWorkload(employeeId);

        // ── Step 2: Fetch Productivity Data ───────────────────────────────────
        Map<String, Object> productivityData = productivityService.getProductivity(employeeId);

        // ── Step 3: Fetch Deadline Risk Data (filtered by employee) ────────────
        List<Map<String, Object>> allRisks = deadlineRiskService.getDeadlineRisk();

        List<Map<String, Object>> employeeRisks = allRisks.stream()
                .filter(risk -> {
                    Object assignedTo = risk.get("assignedToId");
                    return assignedTo != null && assignedTo.equals(employeeId);
                })
                .collect(Collectors.toList());

        // ── Step 4: Build Workload Summary ─────────────────────────────────────
        Map<String, Object> workloadSummary = new HashMap<>();
        workloadSummary.put("totalTasks",             workloadData.get("totalTasks"));
        workloadSummary.put("totalHours",             workloadData.get("totalHours"));
        workloadSummary.put("capacity",               workloadData.get("capacity"));
        workloadSummary.put("utilizationPercentage",  workloadData.get("utilizationPercentage"));
        workloadSummary.put("workloadStatus",         workloadData.get("workloadStatus"));

        // ── Step 5: Build Productivity Summary ────────────────────────────────
        Map<String, Object> productivitySummary = new HashMap<>();
        productivitySummary.put("totalTasks",              productivityData.get("totalTasks"));
        productivitySummary.put("completedTasks",          productivityData.get("completedTasks"));
        productivitySummary.put("pendingTasks",            productivityData.get("pendingTasks"));
        productivitySummary.put("productivityPercentage",  productivityData.get("productivityPercentage"));
        productivitySummary.put("productivityRating",      productivityData.get("productivityRating"));

        // ── Step 6: Build Risk Summary ─────────────────────────────────────────
        long criticalCount = employeeRisks.stream()
                .filter(r -> "CRITICAL".equals(r.get("riskLevel"))).count();

        long highCount = employeeRisks.stream()
                .filter(r -> "HIGH".equals(r.get("riskLevel"))).count();

        long lowCount = employeeRisks.stream()
                .filter(r -> "LOW".equals(r.get("riskLevel"))).count();

        Map<String, Object> riskSummary = new HashMap<>();
        riskSummary.put("totalRiskyTasks",  employeeRisks.size());
        riskSummary.put("criticalCount",    criticalCount);
        riskSummary.put("highCount",        highCount);
        riskSummary.put("lowCount",         lowCount);

        // ── Step 7: Build Overall Health Score ────────────────────────────────
        double productivityScore   = (double) productivityData.get("productivityPercentage");
        double utilizationScore    = (double) workloadData.get("utilizationPercentage");
        double riskPenalty         = (criticalCount * 15.0) + (highCount * 5.0);
        double healthScore         = Math.max(
                Math.round(((productivityScore + (100 - utilizationScore)) / 2.0) - riskPenalty),
                0.0
        );

        String healthStatus;
        if (healthScore >= 75.0) {
            healthStatus = "HEALTHY";
        } else if (healthScore >= 50.0) {
            healthStatus = "MODERATE";
        } else if (healthScore >= 25.0) {
            healthStatus = "AT_RISK";
        } else {
            healthStatus = "CRITICAL";
        }

        log.info("Dashboard built for employee {}: health={}%, status={}",
                employeeId, healthScore, healthStatus);

        // ── Step 8: Assemble Final Dashboard ──────────────────────────────────
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("employeeId",    employeeId);
        dashboard.put("employeeName",  workloadData.get("employeeName"));
        dashboard.put("department",    workloadData.get("department"));
        dashboard.put("workload",      workloadSummary);
        dashboard.put("productivity",  productivitySummary);
        dashboard.put("riskSummary",   riskSummary);
        dashboard.put("risks",         employeeRisks);
        dashboard.put("healthScore",   healthScore);
        dashboard.put("healthStatus",  healthStatus);

        return dashboard;
    }
}