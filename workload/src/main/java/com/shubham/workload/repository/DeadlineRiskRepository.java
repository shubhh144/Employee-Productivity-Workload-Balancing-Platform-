package com.shubham.workload.repository;

import com.shubham.workload.model.DeadlineRisk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeadlineRiskRepository extends JpaRepository<DeadlineRisk, Long> {
}