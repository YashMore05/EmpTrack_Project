package com.employeetracking.repository;

import com.employeetracking.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeIdOrderByAppliedAtDesc(Long employeeId);
    List<LeaveRequest> findByStatusOrderByAppliedAtDesc(String status);
    List<LeaveRequest> findAllByOrderByAppliedAtDesc();
    long countByStatus(String status);

    @Query("SELECT lr FROM LeaveRequest lr WHERE " +
           "(:employeeId IS NULL OR lr.employee.id = :employeeId) AND " +
           "(:leaveType IS NULL OR lr.leaveType = :leaveType) AND " +
           "(:status IS NULL OR lr.status = :status) AND " +
           "(:startDate IS NULL OR lr.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR lr.endDate <= :endDate) " +
           "ORDER BY lr.appliedAt DESC")
    List<LeaveRequest> filterLeaveRequests(@Param("employeeId") Long employeeId,
                                           @Param("leaveType") String leaveType,
                                           @Param("status") String status,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
}
