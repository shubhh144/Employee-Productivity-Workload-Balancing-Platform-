package com.shubham.workload.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "deadline_risks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeadlineRisk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", referencedColumnName = "id", nullable = false, unique = true)
    private Task task;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 10)
    private RiskLevel riskLevel;

    @Column(name = "predicted_delay", nullable = false)
    private Integer predictedDelay;

    public enum RiskLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}