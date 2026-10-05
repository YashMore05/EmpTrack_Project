package com.employeetracking.dto;

import java.time.LocalTime;
import java.util.List;

public class EmployeeDashboardDto {
    private Long employeeId;
    private String employeeCode;
    private String fullName;
    private String designation;
    private String departmentName;

    // Today's attendance info
    private String todayStatus; // "NOT_CHECKED_IN", "PRESENT", "HALF_DAY", "ON_LEAVE"
    private LocalTime todayCheckIn;
    private LocalTime todayCheckOut;
    private Double todayWorkingHours;

    // Leave balance
    private Integer casualLeave;
    private Integer sickLeave;
    private Integer paidLeave;
    private Integer unpaidLeave;

    // Counts
    private long pendingLeavesCount;
    private long approvedLeavesCount;

    // Recents
    private List<AttendanceDto> recentAttendance;
    private List<LeaveRequestDto> recentLeaves;

    public EmployeeDashboardDto() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getTodayStatus() {
        return todayStatus;
    }

    public void setTodayStatus(String todayStatus) {
        this.todayStatus = todayStatus;
    }

    public LocalTime getTodayCheckIn() {
        return todayCheckIn;
    }

    public void setTodayCheckIn(LocalTime todayCheckIn) {
        this.todayCheckIn = todayCheckIn;
    }

    public LocalTime getTodayCheckOut() {
        return todayCheckOut;
    }

    public void setTodayCheckOut(LocalTime todayCheckOut) {
        this.todayCheckOut = todayCheckOut;
    }

    public Double getTodayWorkingHours() {
        return todayWorkingHours;
    }

    public void setTodayWorkingHours(Double todayWorkingHours) {
        this.todayWorkingHours = todayWorkingHours;
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

    public long getPendingLeavesCount() {
        return pendingLeavesCount;
    }

    public void setPendingLeavesCount(long pendingLeavesCount) {
        this.pendingLeavesCount = pendingLeavesCount;
    }

    public long getApprovedLeavesCount() {
        return approvedLeavesCount;
    }

    public void setApprovedLeavesCount(long approvedLeavesCount) {
        this.approvedLeavesCount = approvedLeavesCount;
    }

    public List<AttendanceDto> getRecentAttendance() {
        return recentAttendance;
    }

    public void setRecentAttendance(List<AttendanceDto> recentAttendance) {
        this.recentAttendance = recentAttendance;
    }

    public List<LeaveRequestDto> getRecentLeaves() {
        return recentLeaves;
    }

    public void setRecentLeaves(List<LeaveRequestDto> recentLeaves) {
        this.recentLeaves = recentLeaves;
    }
}
