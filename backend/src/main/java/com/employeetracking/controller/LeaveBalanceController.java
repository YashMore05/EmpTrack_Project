package com.employeetracking.controller;

import com.employeetracking.dto.LeaveBalanceDto;
import com.employeetracking.service.LeaveBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leave-balance")
public class LeaveBalanceController {

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    @GetMapping("/{employeeId}")
    public ResponseEntity<LeaveBalanceDto> getLeaveBalance(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveBalanceService.getLeaveBalanceByEmployeeId(employeeId));
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<LeaveBalanceDto> updateLeaveBalance(
            @PathVariable Long employeeId,
            @RequestBody LeaveBalanceDto dto) {
        return ResponseEntity.ok(leaveBalanceService.updateLeaveBalance(employeeId, dto));
    }
}
