package com.employeetracking.repository;

import com.employeetracking.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeCode(String employeeCode);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByUserId(Long userId);
    List<Employee> findByDepartmentId(Long departmentId);
    List<Employee> findByStatus(String status);
    long countByStatus(String status);
    boolean existsByEmployeeCode(String employeeCode);
    boolean existsByEmail(String email);

    @Query("SELECT e FROM Employee e WHERE " +
           "(:departmentId IS NULL OR e.department.id = :departmentId) AND " +
           "(:status IS NULL OR LOWER(e.status) = LOWER(:status)) AND " +
           "(:search IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.designation) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Employee> searchEmployees(@Param("search") String search,
                                   @Param("departmentId") Long departmentId,
                                   @Param("status") String status);
}
