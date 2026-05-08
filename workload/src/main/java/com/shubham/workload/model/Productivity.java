package com.shubham.workload.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "productivity")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Productivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", referencedColumnName = "id", nullable = false)
    private Employee employee;

    @Column(name = "score", nullable = false)
    private Double score;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;
}