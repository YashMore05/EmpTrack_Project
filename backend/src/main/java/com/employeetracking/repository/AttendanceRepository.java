package com.employeetracking.repository;

import com.employeetracking.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);
    List<Attendance> findByEmployeeIdOrderByAttendanceDateDesc(Long employeeId);
    List<Attendance> findByAttendanceDateOrderByEmployeeFullNameAsc(LocalDate attendanceDate);
    List<Attendance> findByAttendanceDateBetweenOrderByAttendanceDateDesc(LocalDate startDate, LocalDate endDate);
    long countByAttendanceDateAndStatus(LocalDate date, String status);

    @Query("SELECT a FROM Attendance a WHERE " +
           "(:date IS NULL OR a.attendanceDate = :date) AND " +
           "(:employeeId IS NULL OR a.employee.id = :employeeId) AND " +
           "(:departmentId IS NULL OR a.employee.department.id = :departmentId) AND " +
           "(:status IS NULL OR LOWER(a.status) = LOWER(:status)) " +
           "ORDER BY a.attendanceDate DESC, a.employee.fullName ASC")
    List<Attendance> filterAttendance(@Param("date") LocalDate date,
                                      @Param("employeeId") Long employeeId,
                                      @Param("departmentId") Long departmentId,
                                      @Param("status") String status);
}
