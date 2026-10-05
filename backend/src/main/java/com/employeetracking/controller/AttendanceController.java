package com.employeetracking.controller;

import com.employeetracking.dto.AttendanceDto;
import com.employeetracking.dto.ManualAttendanceRequest;
import com.employeetracking.service.AttendanceService;
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
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<List<AttendanceDto>> getAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(attendanceService.filterAttendance(date, employeeId, departmentId, status));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceDto>> getAttendanceByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEmployee(employeeId));
    }

    @GetMapping("/today/{employeeId}")
    public ResponseEntity<AttendanceDto> getTodayAttendance(@PathVariable Long employeeId) {
        AttendanceDto dto = attendanceService.getTodayAttendance(employeeId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceDto> checkIn(@RequestBody Map<String, Long> payload) {
        Long employeeId = payload.get("employeeId");
        if (employeeId == null) {
            return ResponseEntity.badRequest().build();
        }
        AttendanceDto dto = attendanceService.checkIn(employeeId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/check-out")
    public ResponseEntity<AttendanceDto> checkOut(@RequestBody Map<String, Long> payload) {
        Long employeeId = payload.get("employeeId");
        if (employeeId == null) {
            return ResponseEntity.badRequest().build();
        }
        AttendanceDto dto = attendanceService.checkOut(employeeId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/manual")
    public ResponseEntity<AttendanceDto> logManualAttendance(@Valid @RequestBody ManualAttendanceRequest req) {
        AttendanceDto dto = attendanceService.logManualAttendance(req);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }
}
