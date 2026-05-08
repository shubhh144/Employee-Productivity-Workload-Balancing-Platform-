package com.shubham.workload.controller;

import com.shubham.workload.model.Employee;
import com.shubham.workload.model.Task;
import com.shubham.workload.repository.TaskRepository;
import com.shubham.workload.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final TaskRepository  taskRepository;

    // ─── GET /employee/all ─────────────────────────────────────────────────────

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllEmployees() {
        log.info("REST request to get all employees");

        List<Employee> employees = employeeService.getAllEmployees();

        List<Map<String, Object>> employeeList = employees.stream()
                .map(emp -> {
                    List<Task> tasks = taskRepository
                            .findByAssignedToId(emp.getId());

                    Map<String, Object> empData = new HashMap<>();
                    empData.put("employeeId", emp.getId());
                    empData.put("name",       emp.getName());
                    empData.put("department", emp.getDepartment());
                    empData.put("capacity",   emp.getCapacity());
                    empData.put("taskCount",  tasks.size());
                    return empData;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success",        true);
        response.put("totalEmployees", employeeList.size());
        response.put("data",           employeeList);

        return ResponseEntity.ok(response);
    }

    // ─── GET /employee/{id}/tasks ──────────────────────────────────────────────

    @GetMapping("/{id}/tasks")
    public ResponseEntity<Map<String, Object>> getEmployeeTasks(
            @PathVariable Long id) {
        log.info("REST request to get tasks for employee id: {}", id);

        List<Task> tasks = employeeService.getEmployeeTasks(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success",    true);
        response.put("employeeId", id);
        response.put("totalTasks", tasks.size());
        response.put("data",       tasks);

        return ResponseEntity.ok(response);
    }
}