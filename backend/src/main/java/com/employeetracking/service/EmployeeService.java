package com.employeetracking.service;

import com.employeetracking.dto.EmployeeDto;
import com.employeetracking.entity.Department;
import com.employeetracking.entity.Employee;
import com.employeetracking.entity.LeaveBalance;
import com.employeetracking.entity.User;
import com.employeetracking.exception.BadRequestException;
import com.employeetracking.exception.DuplicateResourceException;
import com.employeetracking.exception.ResourceNotFoundException;
import com.employeetracking.repository.AttendanceRepository;
import com.employeetracking.repository.DepartmentRepository;
import com.employeetracking.repository.EmployeeRepository;
import com.employeetracking.repository.LeaveBalanceRepository;
import com.employeetracking.repository.LeaveRequestRepository;
import com.employeetracking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToDto(employee);
    }

    public EmployeeDto getEmployeeByUserId(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for user id: " + userId));
        return mapToDto(employee);
    }

    public List<EmployeeDto> searchEmployees(String search, Long departmentId, String status) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;

        return employeeRepository.searchEmployees(cleanSearch, departmentId, cleanStatus).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeDto createEmployee(EmployeeDto dto) {
        String code = dto.getEmployeeCode().trim().toUpperCase();
        String email = dto.getEmail().trim().toLowerCase();

        if (employeeRepository.existsByEmployeeCode(code)) {
            throw new DuplicateResourceException("Employee ID / Code '" + code + "' is already in use");
        }

        if (employeeRepository.existsByEmail(email) || userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email '" + email + "' is already registered");
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));

        // Create linked User login
        String password = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty())
                ? dto.getPassword().trim()
                : "employee123";

        User user = new User(email, password, "EMPLOYEE");
        user.setEnabled(!"INACTIVE".equalsIgnoreCase(dto.getStatus()));
        User savedUser = userRepository.save(user);

        // Create Employee
        Employee employee = new Employee();
        employee.setEmployeeCode(code);
        employee.setFullName(dto.getFullName().trim());
        employee.setEmail(email);
        employee.setPhone(dto.getPhone());
        employee.setGender(dto.getGender());
        employee.setDateOfBirth(dto.getDateOfBirth());
        employee.setDepartment(department);
        employee.setDesignation(dto.getDesignation().trim());
        employee.setJoiningDate(dto.getJoiningDate());
        employee.setAddress(dto.getAddress());
        employee.setSalary(dto.getSalary());
        employee.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ACTIVE");
        employee.setUser(savedUser);

        Employee savedEmployee = employeeRepository.save(employee);

        // Initialize default leave balance
        LeaveBalance leaveBalance = new LeaveBalance(savedEmployee, 8, 6, 12, 0);
        leaveBalanceRepository.save(leaveBalance);

        return mapToDto(savedEmployee);
    }

    @Transactional
    public EmployeeDto updateEmployee(Long id, EmployeeDto dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        String code = dto.getEmployeeCode().trim().toUpperCase();
        String email = dto.getEmail().trim().toLowerCase();

        if (!employee.getEmployeeCode().equalsIgnoreCase(code) && employeeRepository.existsByEmployeeCode(code)) {
            throw new DuplicateResourceException("Employee ID / Code '" + code + "' is already in use");
        }

        if (!employee.getEmail().equalsIgnoreCase(email)) {
            if (employeeRepository.existsByEmail(email) || userRepository.existsByEmail(email)) {
                throw new DuplicateResourceException("Email '" + email + "' is already registered");
            }
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));

        employee.setEmployeeCode(code);
        employee.setFullName(dto.getFullName().trim());
        employee.setEmail(email);
        employee.setPhone(dto.getPhone());
        employee.setGender(dto.getGender());
        employee.setDateOfBirth(dto.getDateOfBirth());
        employee.setDepartment(department);
        employee.setDesignation(dto.getDesignation().trim());
        employee.setJoiningDate(dto.getJoiningDate());
        employee.setAddress(dto.getAddress());
        employee.setSalary(dto.getSalary());

        String newStatus = dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ACTIVE";
        employee.setStatus(newStatus);

        // Sync with User
        if (employee.getUser() != null) {
            employee.getUser().setEmail(email);
            employee.getUser().setEnabled("ACTIVE".equalsIgnoreCase(newStatus));
            if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
                employee.getUser().setPassword(dto.getPassword().trim());
            }
        }

        Employee updated = employeeRepository.save(employee);
        return mapToDto(updated);
    }

    @Transactional
    public void deactivateEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setStatus("INACTIVE");
        if (employee.getUser() != null) {
            employee.getUser().setEnabled(false);
        }
        employeeRepository.save(employee);
    }

    @Transactional
    public void activateEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setStatus("ACTIVE");
        if (employee.getUser() != null) {
            employee.getUser().setEnabled(true);
        }
        employeeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        // Delete attendance logs
        attendanceRepository.deleteAll(attendanceRepository.findByEmployeeIdOrderByAttendanceDateDesc(id));

        // Delete leave requests
        leaveRequestRepository.deleteAll(leaveRequestRepository.findByEmployeeIdOrderByAppliedAtDesc(id));

        // Delete leave balance
        leaveBalanceRepository.findByEmployeeId(id).ifPresent(leaveBalanceRepository::delete);

        // Delete employee & linked user login
        User user = employee.getUser();
        employeeRepository.delete(employee);
        if (user != null) {
            userRepository.delete(user);
        }
    }

    public EmployeeDto mapToDto(Employee emp) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(emp.getId());
        dto.setEmployeeCode(emp.getEmployeeCode());
        dto.setFullName(emp.getFullName());
        dto.setEmail(emp.getEmail());
        dto.setPhone(emp.getPhone());
        dto.setGender(emp.getGender());
        dto.setDateOfBirth(emp.getDateOfBirth());
        if (emp.getDepartment() != null) {
            dto.setDepartmentId(emp.getDepartment().getId());
            dto.setDepartmentName(emp.getDepartment().getName());
        }
        dto.setDesignation(emp.getDesignation());
        dto.setJoiningDate(emp.getJoiningDate());
        dto.setAddress(emp.getAddress());
        dto.setSalary(emp.getSalary());
        dto.setStatus(emp.getStatus());
        return dto;
    }
}
