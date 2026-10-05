package com.employeetracking.controller;

import com.employeetracking.dto.AdminDashboardDto;
import com.employeetracking.dto.EmployeeDashboardDto;
import com.employeetracking.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/admin")
    public ResponseEntity<AdminDashboardDto> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboardData());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<EmployeeDashboardDto> getEmployeeDashboard(@PathVariable Long employeeId) {
        return ResponseEntity.ok(dashboardService.getEmployeeDashboardData(employeeId));
    }
}
