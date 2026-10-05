package com.employeetracking.service;

import com.employeetracking.dto.LeaveBalanceDto;
import com.employeetracking.entity.Employee;
import com.employeetracking.entity.LeaveBalance;
import com.employeetracking.exception.ResourceNotFoundException;
import com.employeetracking.repository.EmployeeRepository;
import com.employeetracking.repository.LeaveBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LeaveBalanceService {

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public LeaveBalanceDto getLeaveBalanceByEmployeeId(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> {
                    LeaveBalance newBalance = new LeaveBalance(employee, 8, 6, 12, 0);
                    return leaveBalanceRepository.save(newBalance);
                });

        return mapToDto(balance);
    }

    @Transactional
    public LeaveBalanceDto updateLeaveBalance(Long employeeId, LeaveBalanceDto dto) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found for employee id: " + employeeId));

        if (dto.getCasualLeave() != null) balance.setCasualLeave(dto.getCasualLeave());
        if (dto.getSickLeave() != null) balance.setSickLeave(dto.getSickLeave());
        if (dto.getPaidLeave() != null) balance.setPaidLeave(dto.getPaidLeave());
        if (dto.getUnpaidLeave() != null) balance.setUnpaidLeave(dto.getUnpaidLeave());

        LeaveBalance saved = leaveBalanceRepository.save(balance);
        return mapToDto(saved);
    }

    public LeaveBalanceDto mapToDto(LeaveBalance balance) {
        return new LeaveBalanceDto(
                balance.getId(),
                balance.getEmployee().getId(),
                balance.getEmployee().getFullName(),
                balance.getCasualLeave(),
                balance.getSickLeave(),
                balance.getPaidLeave(),
                balance.getUnpaidLeave()
        );
    }
}
