package com.shubham.workload.repository;

import com.shubham.workload.model.Workload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkloadRepository extends JpaRepository<Workload, Long> {

    Optional<Workload> findByEmployeeId(Long employeeId);
}