package com.shubham.workload.repository;

import com.shubham.workload.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedToId(Long employeeId);

    long countByStatus(Task.Status status);  // ← ye add karo
}