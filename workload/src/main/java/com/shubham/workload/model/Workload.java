package com.shubham.workload.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workloads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", referencedColumnName = "id", nullable = false, unique = true)
    private Employee employee;

    @Column(name = "total_hours", nullable = false)
    private Double totalHours;

    @Column(name = "utilization", nullable = false)
    private Double utilization;
}