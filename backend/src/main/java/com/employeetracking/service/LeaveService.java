package com.employeetracking.service;

import com.employeetracking.dto.CreateLeaveRequest;
import com.employeetracking.dto.LeaveRequestDto;
import com.employeetracking.entity.Attendance;
import com.employeetracking.entity.Employee;
import com.employeetracking.entity.LeaveBalance;
import com.employeetracking.entity.LeaveRequest;
import com.employeetracking.exception.BadRequestException;
import com.employeetracking.exception.ResourceNotFoundException;
import com.employeetracking.repository.AttendanceRepository;
import com.employeetracking.repository.EmployeeRepository;
import com.employeetracking.repository.LeaveBalanceRepository;
import com.employeetracking.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    public List<LeaveRequestDto> getAllLeaves() {
        return leaveRequestRepository.findAllByOrderByAppliedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getLeavesByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByAppliedAtDesc(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDto> filterLeaves(Long employeeId, String leaveType, String status, LocalDate startDate, LocalDate endDate) {
        String cleanType = (leaveType != null && !leaveType.trim().isEmpty() && !"ALL".equalsIgnoreCase(leaveType)) ? leaveType.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;

        return leaveRequestRepository.filterLeaveRequests(employeeId, cleanType, cleanStatus, startDate, endDate).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestDto applyLeave(CreateLeaveRequest req) {
        Employee employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + req.getEmployeeId()));

        if (!"ACTIVE".equalsIgnoreCase(employee.getStatus())) {
            throw new BadRequestException("Inactive employees cannot apply for leave.");
        }

        if (req.getStartDate() == null || req.getEndDate() == null) {
            throw new BadRequestException("Start date and End date are required.");
        }

        if (req.getStartDate().isAfter(req.getEndDate())) {
            throw new BadRequestException("Leave start date cannot be after end date.");
        }

        int requestedDays = (int) ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        if (requestedDays <= 0) {
            throw new BadRequestException("Number of leave days must be greater than zero.");
        }

        String type = req.getLeaveType().toUpperCase();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employee.getId())
                .orElseGet(() -> leaveBalanceRepository.save(new LeaveBalance(employee, 8, 6, 12, 0)));

        // Validate available leave balance
        if ("CASUAL_LEAVE".equals(type)) {
            if (balance.getCasualLeave() < requestedDays) {
                throw new BadRequestException("Insufficient Casual Leave balance. Available: " + balance.getCasualLeave() + " day(s), requested: " + requestedDays + " day(s).");
            }
        } else if ("SICK_LEAVE".equals(type)) {
            if (balance.getSickLeave() < requestedDays) {
                throw new BadRequestException("Insufficient Sick Leave balance. Available: " + balance.getSickLeave() + " day(s), requested: " + requestedDays + " day(s).");
            }
        } else if ("PAID_LEAVE".equals(type)) {
            if (balance.getPaidLeave() < requestedDays) {
                throw new BadRequestException("Insufficient Paid Leave balance. Available: " + balance.getPaidLeave() + " day(s), requested: " + requestedDays + " day(s).");
            }
        } else if (!"UNPAID_LEAVE".equals(type)) {
            throw new BadRequestException("Invalid leave type: " + req.getLeaveType());
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(type);
        leaveRequest.setStartDate(req.getStartDate());
        leaveRequest.setEndDate(req.getEndDate());
        leaveRequest.setNumberOfDays(requestedDays);
        leaveRequest.setReason(req.getReason().trim());
        leaveRequest.setStatus("PENDING");
        leaveRequest.setAppliedAt(LocalDateTime.now());

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToDto(saved);
    }

    @Transactional
    public LeaveRequestDto approveLeave(Long leaveRequestId) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveRequestId));

        if (!"PENDING".equalsIgnoreCase(leave.getStatus())) {
            throw new BadRequestException("Cannot approve a leave request with status: " + leave.getStatus());
        }

        Employee employee = leave.getEmployee();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employee.getId())
                .orElseGet(() -> leaveBalanceRepository.save(new LeaveBalance(employee, 8, 6, 12, 0)));

        int days = leave.getNumberOfDays();
        String type = leave.getLeaveType();

        // Deduct balance
        if ("CASUAL_LEAVE".equals(type)) {
            balance.setCasualLeave(Math.max(0, balance.getCasualLeave() - days));
        } else if ("SICK_LEAVE".equals(type)) {
            balance.setSickLeave(Math.max(0, balance.getSickLeave() - days));
        } else if ("PAID_LEAVE".equals(type)) {
            balance.setPaidLeave(Math.max(0, balance.getPaidLeave() - days));
        } else if ("UNPAID_LEAVE".equals(type)) {
            balance.setUnpaidLeave(balance.getUnpaidLeave() + days);
        }
        leaveBalanceRepository.save(balance);

        // Update leave request status
        leave.setStatus("APPROVED");
        leave.setProcessedAt(LocalDateTime.now());
        LeaveRequest updatedLeave = leaveRequestRepository.save(leave);

        // Update attendance to ON_LEAVE for all days in the leave range
        LocalDate curr = leave.getStartDate();
        while (!curr.isAfter(leave.getEndDate())) {
            Attendance att = attendanceRepository.findByEmployeeIdAndAttendanceDate(employee.getId(), curr)
                    .orElse(new Attendance());
            att.setEmployee(employee);
            att.setAttendanceDate(curr);
            att.setStatus("ON_LEAVE");
            att.setWorkingHours(0.0);
            attendanceRepository.save(att);
            curr = curr.plusDays(1);
        }

        return mapToDto(updatedLeave);
    }

    @Transactional
    public LeaveRequestDto rejectLeave(Long leaveRequestId, String rejectionReason) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveRequestId));

        if (!"PENDING".equalsIgnoreCase(leave.getStatus())) {
            throw new BadRequestException("Cannot reject a leave request with status: " + leave.getStatus());
        }

        leave.setStatus("REJECTED");
        leave.setRejectionReason(rejectionReason != null ? rejectionReason.trim() : "Rejected by Administrator");
        leave.setProcessedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRequestRepository.save(leave);
        return mapToDto(updated);
    }

    @Transactional
    public LeaveRequestDto cancelLeave(Long leaveRequestId, Long requestingEmployeeId) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveRequestId));

        if (!"PENDING".equalsIgnoreCase(leave.getStatus())) {
            throw new BadRequestException("Only pending leave requests can be cancelled. Current status: " + leave.getStatus());
        }

        if (requestingEmployeeId != null && !leave.getEmployee().getId().equals(requestingEmployeeId)) {
            throw new BadRequestException("You can only cancel your own leave requests.");
        }

        leave.setStatus("CANCELLED");
        leave.setProcessedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRequestRepository.save(leave);
        return mapToDto(updated);
    }

    public LeaveRequestDto mapToDto(LeaveRequest lr) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(lr.getId());
        if (lr.getEmployee() != null) {
            dto.setEmployeeId(lr.getEmployee().getId());
            dto.setEmployeeCode(lr.getEmployee().getEmployeeCode());
            dto.setEmployeeName(lr.getEmployee().getFullName());
            if (lr.getEmployee().getDepartment() != null) {
                dto.setDepartmentName(lr.getEmployee().getDepartment().getName());
            }
        }
        dto.setLeaveType(lr.getLeaveType());
        dto.setStartDate(lr.getStartDate());
        dto.setEndDate(lr.getEndDate());
        dto.setNumberOfDays(lr.getNumberOfDays());
        dto.setReason(lr.getReason());
        dto.setStatus(lr.getStatus());
        dto.setRejectionReason(lr.getRejectionReason());
        dto.setAppliedAt(lr.getAppliedAt());
        dto.setProcessedAt(lr.getProcessedAt());
        return dto;
    }
}
