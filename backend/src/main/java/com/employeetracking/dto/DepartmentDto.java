package com.employeetracking.dto;

import jakarta.validation.constraints.NotBlank;

public class DepartmentDto {
    private Long id;

    @NotBlank(message = "Department name is required")
    private String name;

    private String description;
    private long employeeCount;

    public DepartmentDto() {
    }

    public DepartmentDto(Long id, String name, String description, long employeeCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.employeeCount = employeeCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(long employeeCount) {
        this.employeeCount = employeeCount;
    }
}
