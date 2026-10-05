package com.employeetracking.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardDto {
    private long totalEmployees;
    private long activeEmployees;
    private long onLeaveToday;
    private long pendingLeaveRequests;
    private long approvedLeaves;
    private long rejectedLeaves;
    private Map<String, Long> departmentDistribution;
    private Map<String, Long> leaveStatusDistribution;
    private List<LeaveRequestDto> recentLeaveRequests;
    private List<AttendanceDto> recentAttendance;

    public AdminDashboardDto() {
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getActiveEmployees() {
        return activeEmployees;
    }

    public void setActiveEmployees(long activeEmployees) {
        this.activeEmployees = activeEmployees;
    }

    public long getOnLeaveToday() {
        return onLeaveToday;
    }

    public void setOnLeaveToday(long onLeaveToday) {
        this.onLeaveToday = onLeaveToday;
    }

    public long getPendingLeaveRequests() {
        return pendingLeaveRequests;
    }

    public void setPendingLeaveRequests(long pendingLeaveRequests) {
        this.pendingLeaveRequests = pendingLeaveRequests;
    }

    public long getApprovedLeaves() {
        return approvedLeaves;
    }

    public void setApprovedLeaves(long approvedLeaves) {
        this.approvedLeaves = approvedLeaves;
    }

    public long getRejectedLeaves() {
        return rejectedLeaves;
    }

    public void setRejectedLeaves(long rejectedLeaves) {
        this.rejectedLeaves = rejectedLeaves;
    }

    public Map<String, Long> getDepartmentDistribution() {
        return departmentDistribution;
    }

    public void setDepartmentDistribution(Map<String, Long> departmentDistribution) {
        this.departmentDistribution = departmentDistribution;
    }

    public Map<String, Long> getLeaveStatusDistribution() {
        return leaveStatusDistribution;
    }

    public void setLeaveStatusDistribution(Map<String, Long> leaveStatusDistribution) {
        this.leaveStatusDistribution = leaveStatusDistribution;
    }

    public List<LeaveRequestDto> getRecentLeaveRequests() {
        return recentLeaveRequests;
    }

    public void setRecentLeaveRequests(List<LeaveRequestDto> recentLeaveRequests) {
        this.recentLeaveRequests = recentLeaveRequests;
    }

    public List<AttendanceDto> getRecentAttendance() {
        return recentAttendance;
    }

    public void setRecentAttendance(List<AttendanceDto> recentAttendance) {
        this.recentAttendance = recentAttendance;
    }
}
