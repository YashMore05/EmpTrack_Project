package com.employeetracking.service;

import com.employeetracking.dto.AdminDashboardDto;
import com.employeetracking.dto.EmployeeDashboardDto;
import com.employeetracking.entity.Attendance;
import com.employeetracking.entity.Department;
import com.employeetracking.entity.Employee;
import com.employeetracking.entity.LeaveBalance;
import com.employeetracking.exception.ResourceNotFoundException;
import com.employeetracking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private AttendanceService attendanceService;

    public AdminDashboardDto getAdminDashboardData() {
        AdminDashboardDto dto = new AdminDashboardDto();
        dto.setTotalEmployees(employeeRepository.count());
        dto.setActiveEmployees(employeeRepository.countByStatus("ACTIVE"));

        LocalDate today = LocalDate.now();
        dto.setOnLeaveToday(attendanceRepository.countByAttendanceDateAndStatus(today, "ON_LEAVE"));
        dto.setPendingLeaveRequests(leaveRequestRepository.countByStatus("PENDING"));
        dto.setApprovedLeaves(leaveRequestRepository.countByStatus("APPROVED"));
        dto.setRejectedLeaves(leaveRequestRepository.countByStatus("REJECTED"));

        // Department breakdown
        Map<String, Long> deptMap = new HashMap<>();
        List<Department> departments = departmentRepository.findAll();
        for (Department d : departments) {
            long count = employeeRepository.findByDepartmentId(d.getId()).size();
            deptMap.put(d.getName(), count);
        }
        dto.setDepartmentDistribution(deptMap);

        // Leave status breakdown
        Map<String, Long> leaveMap = new HashMap<>();
        leaveMap.put("PENDING", leaveRequestRepository.countByStatus("PENDING"));
        leaveMap.put("APPROVED", leaveRequestRepository.countByStatus("APPROVED"));
        leaveMap.put("REJECTED", leaveRequestRepository.countByStatus("REJECTED"));
        leaveMap.put("CANCELLED", leaveRequestRepository.countByStatus("CANCELLED"));
        dto.setLeaveStatusDistribution(leaveMap);

        // Recent leave requests (up to 6)
        dto.setRecentLeaveRequests(
                leaveRequestRepository.findAllByOrderByAppliedAtDesc().stream()
                        .limit(6)
                        .map(leaveService::mapToDto)
                        .collect(Collectors.toList())
        );

        // Recent attendance (today's records, up to 10)
        dto.setRecentAttendance(
                attendanceRepository.findByAttendanceDateOrderByEmployeeFullNameAsc(today).stream()
                        .limit(10)
                        .map(attendanceService::mapToDto)
                        .collect(Collectors.toList())
        );

        return dto;
    }

    public EmployeeDashboardDto getEmployeeDashboardData(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        EmployeeDashboardDto dto = new EmployeeDashboardDto();
        dto.setEmployeeId(employee.getId());
        dto.setEmployeeCode(employee.getEmployeeCode());
        dto.setFullName(employee.getFullName());
        dto.setDesignation(employee.getDesignation());
        if (employee.getDepartment() != null) {
            dto.setDepartmentName(employee.getDepartment().getName());
        }

        // Today's attendance
        LocalDate today = LocalDate.now();
        Optional<Attendance> todayAtt = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today);
        if (todayAtt.isPresent()) {
            Attendance att = todayAtt.get();
            dto.setTodayStatus(att.getStatus());
            dto.setTodayCheckIn(att.getCheckIn());
            dto.setTodayCheckOut(att.getCheckOut());
            dto.setTodayWorkingHours(att.getWorkingHours());
        } else {
            dto.setTodayStatus("NOT_CHECKED_IN");
        }

        // Leave balance
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> leaveBalanceRepository.save(new LeaveBalance(employee, 8, 6, 12, 0)));
        dto.setCasualLeave(balance.getCasualLeave());
        dto.setSickLeave(balance.getSickLeave());
        dto.setPaidLeave(balance.getPaidLeave());
        dto.setUnpaidLeave(balance.getUnpaidLeave());

        // Leave requests counts
        long pending = leaveRequestRepository.filterLeaveRequests(employeeId, null, "PENDING", null, null).size();
        long approved = leaveRequestRepository.filterLeaveRequests(employeeId, null, "APPROVED", null, null).size();
        dto.setPendingLeavesCount(pending);
        dto.setApprovedLeavesCount(approved);

        // Recent attendance (last 5)
        dto.setRecentAttendance(
                attendanceRepository.findByEmployeeIdOrderByAttendanceDateDesc(employeeId).stream()
                        .limit(5)
                        .map(attendanceService::mapToDto)
                        .collect(Collectors.toList())
        );

        // Recent leave requests (last 5)
        dto.setRecentLeaves(
                leaveRequestRepository.findByEmployeeIdOrderByAppliedAtDesc(employeeId).stream()
                        .limit(5)
                        .map(leaveService::mapToDto)
                        .collect(Collectors.toList())
        );

        return dto;
    }
}
