package com.employeetracking.dto;

public class LeaveApprovalDto {
    private String status; // "APPROVED" or "REJECTED"
    private String rejectionReason;

    public LeaveApprovalDto() {
    }

    public LeaveApprovalDto(String status, String rejectionReason) {
        this.status = status;
        this.rejectionReason = rejectionReason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
