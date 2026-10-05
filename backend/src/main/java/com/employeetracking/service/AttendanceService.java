package com.employeetracking.service;

import com.employeetracking.dto.AttendanceDto;
import com.employeetracking.dto.ManualAttendanceRequest;
import com.employeetracking.entity.Attendance;
import com.employeetracking.entity.Employee;
import com.employeetracking.exception.BadRequestException;
import com.employeetracking.exception.ResourceNotFoundException;
import com.employeetracking.repository.AttendanceRepository;
import com.employeetracking.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<AttendanceDto> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeIdOrderByAttendanceDateDesc(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AttendanceDto getTodayAttendance(Long employeeId) {
        LocalDate today = LocalDate.now();
        return attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .map(this::mapToDto)
                .orElse(null);
    }

    public List<AttendanceDto> filterAttendance(LocalDate date, Long employeeId, Long departmentId, String status) {
        String cleanStatus = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;
        return attendanceRepository.filterAttendance(date, employeeId, departmentId, cleanStatus).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDto checkIn(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today);

        if (existing.isPresent()) {
            Attendance att = existing.get();
            if (att.getCheckIn() != null) {
                throw new BadRequestException("Employee already checked in today at " + att.getCheckIn().toString().substring(0, 5));
            }
            att.setCheckIn(LocalTime.now().withNano(0));
            att.setStatus("PRESENT");
            return mapToDto(attendanceRepository.save(att));
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setAttendanceDate(today);
        attendance.setCheckIn(LocalTime.now().withNano(0));
        attendance.setStatus("PRESENT");

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDto(saved);
    }

    @Transactional
    public AttendanceDto checkOut(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        LocalDate today = LocalDate.now();
        Attendance att = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElseThrow(() -> new BadRequestException("No check-in record found for today. Please check in first."));

        if (att.getCheckIn() == null) {
            throw new BadRequestException("No check-in record found for today. Please check in first.");
        }

        LocalTime checkOutTime = LocalTime.now().withNano(0);
        att.setCheckOut(checkOutTime);

        // Calculate working hours
        Duration duration = Duration.between(att.getCheckIn(), checkOutTime);
        double hours = (double) duration.toMinutes() / 60.0;
        BigDecimal roundedHours = BigDecimal.valueOf(Math.max(0.0, hours)).setScale(2, RoundingMode.HALF_UP);
        att.setWorkingHours(roundedHours.doubleValue());

        // Status rule: if hours < 4 -> HALF_DAY, else PRESENT
        if (roundedHours.doubleValue() < 4.0 && !"ON_LEAVE".equalsIgnoreCase(att.getStatus())) {
            att.setStatus("HALF_DAY");
        } else if (!"ON_LEAVE".equalsIgnoreCase(att.getStatus())) {
            att.setStatus("PRESENT");
        }

        Attendance saved = attendanceRepository.save(att);
        return mapToDto(saved);
    }

    @Transactional
    public AttendanceDto logManualAttendance(ManualAttendanceRequest req) {
        Employee employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + req.getEmployeeId()));

        Attendance attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(req.getEmployeeId(), req.getAttendanceDate())
                .orElse(new Attendance());

        attendance.setEmployee(employee);
        attendance.setAttendanceDate(req.getAttendanceDate());
        attendance.setCheckIn(req.getCheckIn());
        attendance.setCheckOut(req.getCheckOut());
        attendance.setStatus(req.getStatus() != null ? req.getStatus().toUpperCase() : "PRESENT");

        if (req.getCheckIn() != null && req.getCheckOut() != null) {
            Duration duration = Duration.between(req.getCheckIn(), req.getCheckOut());
            double hours = (double) duration.toMinutes() / 60.0;
            BigDecimal roundedHours = BigDecimal.valueOf(Math.max(0.0, hours)).setScale(2, RoundingMode.HALF_UP);
            attendance.setWorkingHours(roundedHours.doubleValue());
        } else {
            attendance.setWorkingHours(0.0);
        }

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDto(saved);
    }

    public AttendanceDto mapToDto(Attendance att) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(att.getId());
        if (att.getEmployee() != null) {
            dto.setEmployeeId(att.getEmployee().getId());
            dto.setEmployeeCode(att.getEmployee().getEmployeeCode());
            dto.setEmployeeName(att.getEmployee().getFullName());
            if (att.getEmployee().getDepartment() != null) {
                dto.setDepartmentName(att.getEmployee().getDepartment().getName());
            }
        }
        dto.setAttendanceDate(att.getAttendanceDate());
        dto.setCheckIn(att.getCheckIn());
        dto.setCheckOut(att.getCheckOut());
        dto.setWorkingHours(att.getWorkingHours());
        dto.setStatus(att.getStatus());
        return dto;
    }
}
