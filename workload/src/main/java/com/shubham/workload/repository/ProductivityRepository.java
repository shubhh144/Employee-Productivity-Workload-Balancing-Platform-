package com.shubham.workload.repository;

import com.shubham.workload.model.Productivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductivityRepository extends JpaRepository<Productivity, Long> {
}