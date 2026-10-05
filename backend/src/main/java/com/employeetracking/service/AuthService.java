package com.employeetracking.service;

import com.employeetracking.dto.LoginRequest;
import com.employeetracking.dto.LoginResponse;
import com.employeetracking.entity.Employee;
import com.employeetracking.entity.User;
import com.employeetracking.exception.BadRequestException;
import com.employeetracking.exception.ResourceNotFoundException;
import com.employeetracking.repository.EmployeeRepository;
import com.employeetracking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!user.isEnabled()) {
            throw new BadRequestException("This account has been deactivated. Please contact HR.");
        }

        // Simple direct match for clarity & ease of inspection
        if (!user.getPassword().equals(request.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setToken("token-" + UUID.randomUUID());

        if ("EMPLOYEE".equalsIgnoreCase(user.getRole())) {
            Optional<Employee> empOpt = employeeRepository.findByUserId(user.getId());
            if (empOpt.isPresent()) {
                Employee emp = empOpt.get();
                response.setEmployeeId(emp.getId());
                response.setEmployeeCode(emp.getEmployeeCode());
                response.setFullName(emp.getFullName());
                response.setDesignation(emp.getDesignation());
                if (emp.getDepartment() != null) {
                    response.setDepartmentName(emp.getDepartment().getName());
                }
            }
        } else if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            response.setFullName("Admin");
            response.setDesignation("Head of HR & Administration");
        }

        return response;
    }

    public LoginResponse getProfile(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        if ("EMPLOYEE".equalsIgnoreCase(user.getRole())) {
            Optional<Employee> empOpt = employeeRepository.findByUserId(user.getId());
            if (empOpt.isPresent()) {
                Employee emp = empOpt.get();
                response.setEmployeeId(emp.getId());
                response.setEmployeeCode(emp.getEmployeeCode());
                response.setFullName(emp.getFullName());
                response.setDesignation(emp.getDesignation());
                if (emp.getDepartment() != null) {
                    response.setDepartmentName(emp.getDepartment().getName());
                }
            }
        } else {
            response.setFullName("Admin");
            response.setDesignation("Head of HR & Administration");
        }

        return response;
    }
}
