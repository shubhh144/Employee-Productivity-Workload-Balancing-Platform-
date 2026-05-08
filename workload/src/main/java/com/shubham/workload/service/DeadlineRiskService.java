package com.shubham.workload.service;

import com.shubham.workload.model.Task;
import com.shubham.workload.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeadlineRiskService {

    private final TaskRepository taskRepository;

    private static final long HIGH_RISK_DAYS_THRESHOLD = 2L;

    // ─── Get Deadline Risk for All Tasks ──────────────────────────────────────

    public List<Map<String, Object>> getDeadlineRisk() {
        log.info("Calculating deadline risk for all tasks");

        // ── Step 1: Get All Tasks ──────────────────────────────────────────────
        List<Task> allTasks = taskRepository.findAll();

        // ── Step 2: Get Current Date ───────────────────────────────────────────
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> riskReport = new ArrayList<>();

        // ── Step 3: Evaluate Each Task ─────────────────────────────────────────
        for (Task task : allTasks) {

            // Skip completed tasks
            if (task.getStatus() == Task.Status.DONE) {
                continue;
            }

            // ── Step 4: Compare Deadline with Current Date ─────────────────────
            LocalDate deadline  = task.getDeadline();
            long daysRemaining  = ChronoUnit.DAYS.between(today, deadline);

            // ── Step 5: Determine Risk Level ───────────────────────────────────
            String riskLevel;
            String riskReason;

            if (daysRemaining < 0) {
                // Deadline already passed
                riskLevel  = "CRITICAL";
                riskReason = "Deadline overdue by " + Math.abs(daysRemaining) + " day(s)";

            } else if (daysRemaining <= HIGH_RISK_DAYS_THRESHOLD) {
                // Deadline within next 2 days
                riskLevel  = "HIGH";
                riskReason = "Deadline within " + daysRemaining + " day(s)";

            } else {
                // Deadline is safe
                riskLevel  = "LOW";
                riskReason = daysRemaining + " day(s) remaining";
            }

            log.info("Task [{}] - Deadline: {}, Days Remaining: {}, Risk: {}",
                    task.getId(), deadline, daysRemaining, riskLevel);

            // ── Step 6: Build Task Risk Entry ──────────────────────────────────
            Map<String, Object> taskRisk = new HashMap<>();
            taskRisk.put("taskId",         task.getId());
            taskRisk.put("title",          task.getTitle());
            taskRisk.put("deadline",       deadline.toString());
            taskRisk.put("status",         task.getStatus().name());
            taskRisk.put("priority",       task.getPriority().name());
            taskRisk.put("daysRemaining",  daysRemaining);
            taskRisk.put("riskLevel",      riskLevel);
            taskRisk.put("riskReason",     riskReason);
taskRisk.put("assignedToId", task.getAssignedTo() != null ? task.getAssignedTo().getId() : null);
            riskReport.add(taskRisk);
        }

        // ── Step 7: Sort by Risk Level (CRITICAL → HIGH → LOW) ────────────────
        riskReport.sort((a, b) -> {
            int rankA = getRiskRank((String) a.get("riskLevel"));
            int rankB = getRiskRank((String) b.get("riskLevel"));
            return Integer.compare(rankA, rankB);
        });

        log.info("Deadline risk report generated: {} tasks evaluated", riskReport.size());

        return riskReport;
    }

    // ─── Risk Rank Helper (for sorting) ───────────────────────────────────────

    private int getRiskRank(String riskLevel) {
        return switch (riskLevel) {
            case "CRITICAL" -> 1;
            case "HIGH"     -> 2;
            case "LOW"      -> 3;
            default         -> 4;
        };
    }


}