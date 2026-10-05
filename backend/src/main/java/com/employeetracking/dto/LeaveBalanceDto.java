package com.employeetracking.dto;

public class LeaveBalanceDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Integer casualLeave;
    private Integer sickLeave;
    private Integer paidLeave;
    private Integer unpaidLeave;

    public LeaveBalanceDto() {
    }

    public LeaveBalanceDto(Long id, Long employeeId, String employeeName, Integer casualLeave, Integer sickLeave, Integer paidLeave, Integer unpaidLeave) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.casualLeave = casualLeave;
        this.sickLeave = sickLeave;
        this.paidLeave = paidLeave;
        this.unpaidLeave = unpaidLeave;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public Integer getCasualLeave() {
        return casualLeave;
    }

    public void setCasualLeave(Integer casualLeave) {
        this.casualLeave = casualLeave;
    }

    public Integer getSickLeave() {
        return sickLeave;
    }

    public void setSickLeave(Integer sickLeave) {
        this.sickLeave = sickLeave;
    }

    public Integer getPaidLeave() {
        return paidLeave;
    }

    public void setPaidLeave(Integer paidLeave) {
        this.paidLeave = paidLeave;
    }

    public Integer getUnpaidLeave() {
        return unpaidLeave;
    }

    public void setUnpaidLeave(Integer unpaidLeave) {
        this.unpaidLeave = unpaidLeave;
    }
}
