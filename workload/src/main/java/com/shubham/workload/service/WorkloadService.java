package com.shubham.workload.service;

import com.shubham.workload.model.Employee;
import com.shubham.workload.model.Task;
import com.shubham.workload.repository.EmployeeRepository;
import com.shubham.workload.repository.TaskRepository;
import com.shubham.workload.repository.WorkloadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkloadService {

    private final TaskRepository     taskRepository;
    private final EmployeeRepository employeeRepository;
    private final WorkloadRepository workloadRepository;

    private static final double HOURS_PER_TASK = 8.0;

    public Map<String, Object> getEmployeeWorkload(Long employeeId) {
        log.info("Calculating workload for employee id: {}", employeeId);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found with id: " + employeeId));

        List<Task> tasks = taskRepository.findByAssignedToId(employeeId);

        int totalTasks    = tasks.size();
        double totalHours = totalTasks * HOURS_PER_TASK;
        double capacity   = employee.getCapacity();

        double utilizationPercentage = (capacity > 0)
                ? Math.min((totalHours / capacity) * 100.0, 100.0)
                : 0.0;

        String workloadStatus;
        if (utilizationPercentage >= 90.0) {
            workloadStatus = "OVERLOADED";
        } else if (utilizationPercentage >= 60.0) {
            workloadStatus = "OPTIMAL";
        } else if (utilizationPercentage >= 30.0) {
            workloadStatus = "MODERATE";
        } else {
            workloadStatus = "UNDERUTILIZED";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("employeeId",            employeeId);
        response.put("employeeName",          employee.getName());
        response.put("department",            employee.getDepartment());
        response.put("totalTasks",            totalTasks);
        response.put("totalHours",            totalHours);
        response.put("capacity",              capacity);
        response.put("utilizationPercentage",
                Math.round(utilizationPercentage * 100.0) / 100.0);
        response.put("workloadStatus",        workloadStatus);

        return response;
    }
}