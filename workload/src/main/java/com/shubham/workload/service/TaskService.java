package com.shubham.workload.service;

import com.shubham.workload.model.Employee;
import com.shubham.workload.model.Task;
import com.shubham.workload.repository.EmployeeRepository;
import com.shubham.workload.repository.TaskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository     taskRepository;
    private final EmployeeRepository employeeRepository;

    // ─── Create Task ───────────────────────────────────────────────────────────
    @Transactional
    public Task createTask(Task task) {
        log.info("Creating new task: {}", task.getTitle());

        if (task.getTitle() == null || task.getTitle().isBlank()) {
            throw new IllegalArgumentException("Task title must not be empty");
        }
        if (task.getDeadline() == null) {
            throw new IllegalArgumentException("Task deadline must not be null");
        }
        if (task.getPriority() == null) {
            throw new IllegalArgumentException("Task priority must not be null");
        }

        task.setStatus(Task.Status.TODO);
        Task saved = taskRepository.save(task);
        log.info("Task created with id: {}", saved.getId());
        return saved;
    }

    // ─── Assign Task ───────────────────────────────────────────────────────────
    @Transactional
    public Task assignTaskToEmployee(Long taskId, Long employeeId) {
        log.info("Assigning task {} to employee {}", taskId, employeeId);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found with id: " + taskId));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found with id: " + employeeId));

        task.setAssignedTo(employee);
        Task updated = taskRepository.save(task);
        log.info("Task {} assigned to employee {}", taskId, employeeId);
        return updated;
    }

    // ─── Update Task Status ────────────────────────────────────────────────────
    @Transactional
    public Task updateTaskStatus(Long taskId, Task.Status newStatus) {
        log.info("Updating status of task {} to {}", taskId, newStatus);

        if (newStatus == null) {
            throw new IllegalArgumentException("New status must not be null");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found with id: " + taskId));

        if (task.getStatus() == Task.Status.DONE) {
            throw new IllegalStateException(
                    "Cannot update status of a completed task");
        }

        task.setStatus(newStatus);
        return taskRepository.save(task);
    }

    // ─── Get All Tasks ─────────────────────────────────────────────────────────
    public List<Task> getAllTasks() {
        log.info("Fetching all tasks");
        return taskRepository.findAll();
    }

    // ─── Get Task By ID ────────────────────────────────────────────────────────
    public Task getTaskById(Long taskId) {
        log.info("Fetching task with id: {}", taskId);
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found with id: " + taskId));
    }

    // ─── Save Task ─────────────────────────────────────────────────────────────
    @Transactional
    public Task saveTask(Task task) {
        log.info("Saving task with id: {}", task.getId());
        return taskRepository.save(task);
    }

    // ─── Delete Task ───────────────────────────────────────────────────────────
    @Transactional
    public void deleteTask(Long taskId) {
        log.info("Deleting task with id: {}", taskId);

        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found with id: " + taskId);
        }

        taskRepository.deleteById(taskId);
        log.info("Task {} deleted", taskId);
    }
}