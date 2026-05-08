package com.shubham.workload.service;

import com.shubham.workload.model.Employee;
import com.shubham.workload.model.Task;
import com.shubham.workload.model.Workload;
import com.shubham.workload.repository.EmployeeRepository;
import com.shubham.workload.repository.TaskRepository;
import com.shubham.workload.repository.WorkloadRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final TaskRepository taskRepository;
    private final WorkloadRepository workloadRepository;

    // ─── Create Employee ───────────────────────────────────────────────────────

    @Transactional
    public Employee createEmployee(Employee employee) {
        log.info("Creating new employee: {}", employee.getName());

        if (employee.getName() == null || employee.getName().isBlank()) {
            throw new IllegalArgumentException("Employee name must not be empty");
        }
        if (employee.getDepartment() == null || employee.getDepartment().isBlank()) {
            throw new IllegalArgumentException("Employee department must not be empty");
        }
        if (employee.getCapacity() == null || employee.getCapacity() <= 0) {
            throw new IllegalArgumentException("Employee capacity must be greater than 0");
        }

        Employee saved = employeeRepository.save(employee);
        log.info("Employee created successfully with id: {}", saved.getId());
        return saved;
    }

    // ─── Get Employee By ID ────────────────────────────────────────────────────

    public Employee getEmployeeById(Long employeeId) {
        log.info("Fetching employee with id: {}", employeeId);
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
    }

    // ─── Get All Employees ─────────────────────────────────────────────────────

    public List<Employee> getAllEmployees() {
        log.info("Fetching all employees");
        return employeeRepository.findAll();
    }

    // ─── Get Employee Tasks ────────────────────────────────────────────────────

    public List<Task> getEmployeeTasks(Long employeeId) {
        log.info("Fetching tasks for employee id: {}", employeeId);

        if (!employeeRepository.existsById(employeeId)) {
            throw new RuntimeException("Employee not found with id: " + employeeId);
        }

        List<Task> tasks = taskRepository.findByAssignedToId(employeeId);
        log.info("Found {} tasks for employee {}", tasks.size(), employeeId);
        return tasks;
    }

    // ─── Calculate Workload ────────────────────────────────────────────────────

    @Transactional
    public Workload calculateWorkload(Long employeeId) {
        log.info("Calculating workload for employee id: {}", employeeId);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        List<Task> tasks = taskRepository.findByAssignedToId(employeeId);

        // ── Workload Calculation Logic ──────────────────────────────────────────
        // Each task status carries a different hour weight:
        //   TODO        → 2.0 hrs (planned effort)
        //   IN_PROGRESS → 4.0 hrs (active effort)
        //   REVIEW      → 1.0 hrs (nearly done)
        //   BLOCKED     → 3.0 hrs (stalled, still occupies capacity)
        //   DONE        → 0.0 hrs (no remaining effort)

        double totalHours = tasks.stream()
                .mapToDouble(task -> switch (task.getStatus()) {
                    case TODO        -> 2.0;
                    case IN_PROGRESS -> 4.0;
                    case REVIEW      -> 1.0;
                    case BLOCKED     -> 3.0;
                    case DONE        -> 0.0;
                })
                .sum();

        // utilization = (totalHours / capacity) * 100
        double utilization = (employee.getCapacity() > 0)
                ? (totalHours / employee.getCapacity()) * 100.0
                : 0.0;

        // ── Persist or Update Workload ──────────────────────────────────────────
        Workload workload = workloadRepository.findByEmployeeId(employeeId)
                .orElse(Workload.builder().employee(employee).build());

        workload.setTotalHours(totalHours);
        workload.setUtilization(Math.min(utilization, 100.0)); // cap at 100%

        Workload saved = workloadRepository.save(workload);

        log.info("Workload calculated for employee {}: totalHours={}, utilization={}%",
                employeeId, totalHours, utilization);

        return saved;
    }

    // ─── Delete Employee ───────────────────────────────────────────────────────

    @Transactional
    public void deleteEmployee(Long employeeId) {
        log.info("Deleting employee with id: {}", employeeId);

        if (!employeeRepository.existsById(employeeId)) {
            throw new RuntimeException("Employee not found with id: " + employeeId);
        }

        employeeRepository.deleteById(employeeId);
        log.info("Employee {} deleted successfully", employeeId);
    }
}