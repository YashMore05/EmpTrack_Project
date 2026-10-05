package com.employeetracking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "leave_balances")
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Column(name = "casual_leave", nullable = false)
    private Integer casualLeave = 8;

    @Column(name = "sick_leave", nullable = false)
    private Integer sickLeave = 6;

    @Column(name = "paid_leave", nullable = false)
    private Integer paidLeave = 12;

    @Column(name = "unpaid_leave", nullable = false)
    private Integer unpaidLeave = 0;

    public LeaveBalance() {
    }

    public LeaveBalance(Employee employee, Integer casualLeave, Integer sickLeave, Integer paidLeave, Integer unpaidLeave) {
        this.employee = employee;
        this.casualLeave = casualLeave;
        this.sickLeave = sickLeave;
        this.paidLeave = paidLeave;
        this.unpaidLeave = unpaidLeave;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Integer getCasualLeave() {
        return casualLeave;
    }

    public void setCasualLeave(Integer casualLeave) {
        this.casualLeave = casualLeave;
    }

    public Integer getSickLeave() {
        return sickLeave;
    }

    public void setSickLeave(Integer sickLeave) {
        this.sickLeave = sickLeave;
    }

    public Integer getPaidLeave() {
        return paidLeave;
    }

    public void setPaidLeave(Integer paidLeave) {
        this.paidLeave = paidLeave;
    }

    public Integer getUnpaidLeave() {
        return unpaidLeave;
    }

    public void setUnpaidLeave(Integer unpaidLeave) {
        this.unpaidLeave = unpaidLeave;
    }
}
