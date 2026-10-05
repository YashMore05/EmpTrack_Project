package com.employeetracking.controller;

import com.employeetracking.dto.CreateLeaveRequest;
import com.employeetracking.dto.LeaveApprovalDto;
import com.employeetracking.dto.LeaveRequestDto;
import com.employeetracking.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @GetMapping
    public ResponseEntity<List<LeaveRequestDto>> getLeaves(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String leaveType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (employeeId != null || leaveType != null || status != null || startDate != null || endDate != null) {
            return ResponseEntity.ok(leaveService.filterLeaves(employeeId, leaveType, status, startDate, endDate));
        }
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequestDto>> getLeavesByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(employeeId));
    }

    @PostMapping
    public ResponseEntity<LeaveRequestDto> applyLeave(@Valid @RequestBody CreateLeaveRequest req) {
        LeaveRequestDto created = leaveService.applyLeave(req);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveRequestDto> approveLeave(@PathVariable Long id) {
        LeaveRequestDto approved = leaveService.approveLeave(id);
        return ResponseEntity.ok(approved);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveRequestDto> rejectLeave(
            @PathVariable Long id,
            @RequestBody(required = false) LeaveApprovalDto dto) {
        String reason = (dto != null) ? dto.getRejectionReason() : "Rejected by Admin";
        LeaveRequestDto rejected = leaveService.rejectLeave(id, reason);
        return ResponseEntity.ok(rejected);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<LeaveRequestDto> cancelLeave(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Long> payload) {
        Long employeeId = (payload != null) ? payload.get("employeeId") : null;
        LeaveRequestDto cancelled = leaveService.cancelLeave(id, employeeId);
        return ResponseEntity.ok(cancelled);
    }
}
