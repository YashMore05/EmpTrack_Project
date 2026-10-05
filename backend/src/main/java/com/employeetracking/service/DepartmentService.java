package com.employeetracking.service;

import com.employeetracking.dto.DepartmentDto;
import com.employeetracking.entity.Department;
import com.employeetracking.entity.Employee;
import com.employeetracking.exception.BadRequestException;
import com.employeetracking.exception.DuplicateResourceException;
import com.employeetracking.exception.ResourceNotFoundException;
import com.employeetracking.repository.DepartmentRepository;
import com.employeetracking.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream().map(dept -> {
            List<Employee> emps = employeeRepository.findByDepartmentId(dept.getId());
            return new DepartmentDto(dept.getId(), dept.getName(), dept.getDescription(), emps.size());
        }).collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        List<Employee> emps = employeeRepository.findByDepartmentId(dept.getId());
        return new DepartmentDto(dept.getId(), dept.getName(), dept.getDescription(), emps.size());
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new DuplicateResourceException("Department with name '" + dto.getName() + "' already exists");
        }
        Department dept = new Department(dto.getName().trim(), dto.getDescription());
        Department saved = departmentRepository.save(dept);
        return new DepartmentDto(saved.getId(), saved.getName(), saved.getDescription(), 0);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (!dept.getName().equalsIgnoreCase(dto.getName().trim()) &&
                departmentRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new DuplicateResourceException("Department with name '" + dto.getName() + "' already exists");
        }

        dept.setName(dto.getName().trim());
        dept.setDescription(dto.getDescription());
        Department updated = departmentRepository.save(dept);
        List<Employee> emps = employeeRepository.findByDepartmentId(updated.getId());
        return new DepartmentDto(updated.getId(), updated.getName(), updated.getDescription(), emps.size());
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        List<Employee> emps = employeeRepository.findByDepartmentId(id);
        if (!emps.isEmpty()) {
            throw new BadRequestException("Cannot delete department because " + emps.size() + " employee(s) are assigned to it. Reassign employees first.");
        }

        departmentRepository.delete(dept);
    }
}
