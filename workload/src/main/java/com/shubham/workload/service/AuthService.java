package com.shubham.workload.service;

import com.shubham.workload.model.Employee;
import com.shubham.workload.model.User;
import com.shubham.workload.repository.EmployeeRepository;
import com.shubham.workload.repository.UserRepository;
import com.shubham.workload.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository     userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder    passwordEncoder;
    private final JwtUtil            jwtUtil;

    // ─── Register ──────────────────────────────────────────────────────────────
    public Map<String, Object> register(User.Role role, String name,
                                        String email, String password) {
        log.info("Registering user: {}", email);

        // ── Email lowercase karo ───────────────────────────────────────────────
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email already registered: " + normalizedEmail);
        }

        User user = User.builder()
                .name(name)
                .email(normalizedEmail)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        Employee savedEmployee = null;
        if (role == User.Role.EMPLOYEE) {
            Employee employee = Employee.builder()
                    .name(name)
                    .department("General")
                    .capacity(40.0)
                    .build();
            savedEmployee = employeeRepository.save(employee);
            log.info("Employee record created for: {}", normalizedEmail);
        }

        String token = jwtUtil.generateToken(savedUser);

        log.info("Registration successful: {}", normalizedEmail);

        Map<String, Object> response = new HashMap<>();
        response.put("userId",     savedUser.getId());
        response.put("employeeId", savedEmployee != null ? savedEmployee.getId() : null);
        response.put("name",       savedUser.getName());
        response.put("email",      savedUser.getEmail());
        response.put("role",       savedUser.getRole());
        response.put("token",      token);
        return response;
    }

    // ─── Login ─────────────────────────────────────────────────────────────────
    public Map<String, Object> login(String email, String password) {
        log.info("Login attempt: {}", email);

        // ── Email lowercase karo ───────────────────────────────────────────────
        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        Employee employee = null;
        if (user.getRole() == User.Role.EMPLOYEE) {
            employee = employeeRepository.findByName(user.getName())
                    .orElse(null);
        }

        String token = jwtUtil.generateToken(user);
        log.info("Login successful: {}", normalizedEmail);

        Map<String, Object> response = new HashMap<>();
        response.put("userId",     user.getId());
        response.put("employeeId", employee != null ? employee.getId() : null);
        response.put("name",       user.getName());
        response.put("email",      user.getEmail());
        response.put("role",       user.getRole());
        response.put("token",      token);
        return response;
    }
}