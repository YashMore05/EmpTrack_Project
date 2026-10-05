package com.employeetracking.config;

import com.employeetracking.entity.*;
import com.employeetracking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        System.out.println(">>> Initializing Seed Data with Indian Workforce Records...");

        // 1. Create Admin User (HR Administrator)
        User adminUser = new User("admin@example.com", "admin123", "ADMIN");
        userRepository.save(adminUser);

        // 2. Create Departments
        Department it = departmentRepository.save(new Department("IT & Engineering", "Software development, cloud infrastructure, and technical architecture"));
        Department hr = departmentRepository.save(new Department("Human Resources", "Talent acquisition, employee engagement, and people operations"));
        Department finance = departmentRepository.save(new Department("Finance & Accounts", "Financial planning, accounting, taxation, and payroll oversight"));
        Department sales = departmentRepository.save(new Department("Sales & Business Development", "Client acquisition, enterprise solutions, and revenue growth"));
        Department marketing = departmentRepository.save(new Department("Marketing & Brand", "Digital marketing, brand positioning, and social media campaigns"));
        Department ops = departmentRepository.save(new Department("Operations & Logistics", "Facilities, vendor management, and internal operational workflows"));

        // 3. Create 8 Sample Employees with Indian Names & Details
        List<Employee> employees = new ArrayList<>();

        employees.add(createSampleEmp("EMP001", "Aarav Patel", "aarav.patel@example.com", "+91 98201 12345", "Male",
                LocalDate.of(1992, 4, 15), it, "Lead Software Engineer", LocalDate.of(2021, 3, 1),
                "Flat 402, Green Glen Heights, Bellandur, Bengaluru, Karnataka", new BigDecimal("1850000.00")));

        employees.add(createSampleEmp("EMP002", "Priya Sharma", "priya.sharma@example.com", "+91 98112 23456", "Female",
                LocalDate.of(1994, 8, 22), hr, "Senior HR Specialist", LocalDate.of(2022, 1, 15),
                "B-12, Palm Meadows, Powai, Mumbai, Maharashtra", new BigDecimal("1200000.00")));

        employees.add(createSampleEmp("EMP003", "Rohan Verma", "rohan.verma@example.com", "+91 98334 34567", "Male",
                LocalDate.of(1989, 11, 30), finance, "Finance Controller", LocalDate.of(2020, 6, 1),
                "C-704, Golf Course Extension Road, Gurugram, Haryana", new BigDecimal("1600000.00")));

        employees.add(createSampleEmp("EMP004", "Ananya Iyer", "ananya.iyer@example.com", "+91 98445 45678", "Female",
                LocalDate.of(1995, 3, 10), sales, "Enterprise Sales Manager", LocalDate.of(2023, 2, 20),
                "Block 5, Anna Nagar West, Chennai, Tamil Nadu", new BigDecimal("1350000.00")));

        employees.add(createSampleEmp("EMP005", "Vikram Malhotra", "vikram.malhotra@example.com", "+91 98556 56789", "Male",
                LocalDate.of(1991, 7, 18), marketing, "Brand & Growth Lead", LocalDate.of(2021, 9, 10),
                "14th Cross, Jubilee Hills, Hyderabad, Telangana", new BigDecimal("1400000.00")));

        employees.add(createSampleEmp("EMP006", "Neha Kulkarni", "neha.kulkarni@example.com", "+91 98667 67890", "Female",
                LocalDate.of(1996, 12, 5), ops, "Operations Coordinator", LocalDate.of(2023, 5, 1),
                "Flat 101, Mayur Vihar, Kothrud, Pune, Maharashtra", new BigDecimal("850000.00")));

        employees.add(createSampleEmp("EMP007", "Aditya Nair", "aditya.nair@example.com", "+91 98778 78901", "Male",
                LocalDate.of(1993, 2, 14), it, "Senior DevOps & Cloud Architect", LocalDate.of(2022, 8, 15),
                "Edappally North, Kochi, Kerala", new BigDecimal("1700000.00")));

        employees.add(createSampleEmp("EMP008", "Pooja Deshmukh", "pooja.deshmukh@example.com", "+91 98889 89012", "Female",
                LocalDate.of(1997, 6, 25), hr, "Talent Acquisition Specialist", LocalDate.of(2023, 10, 1),
                "Row House 9, Viman Nagar, Pune, Maharashtra", new BigDecimal("900000.00")));

        // 4. Initialize Leave Balances for all employees (8 Casual, 6 Sick, 12 Paid, 0 Unpaid)
        for (Employee emp : employees) {
            LeaveBalance lb = new LeaveBalance(emp, 8, 6, 12, 0);
            leaveBalanceRepository.save(lb);
        }

        // 5. Attendance Records for past 5 working days + today
        LocalDate today = LocalDate.now();

        for (int i = 5; i >= 1; i--) {
            LocalDate pastDate = today.minusDays(i);
            for (Employee emp : employees) {
                if (emp.getEmployeeCode().equals("EMP001") || emp.getEmployeeCode().equals("EMP002")) {
                    attendanceRepository.save(new Attendance(emp, pastDate, LocalTime.of(9, 15), LocalTime.of(18, 0), 8.75, "PRESENT"));
                } else if (emp.getEmployeeCode().equals("EMP003") && i == 2) {
                    attendanceRepository.save(new Attendance(emp, pastDate, LocalTime.of(9, 30), LocalTime.of(13, 15), 3.75, "HALF_DAY"));
                } else if (emp.getEmployeeCode().equals("EMP006") && i == 1) {
                    attendanceRepository.save(new Attendance(emp, pastDate, null, null, 0.0, "ON_LEAVE"));
                } else {
                    attendanceRepository.save(new Attendance(emp, pastDate, LocalTime.of(9, 20), LocalTime.of(17, 50), 8.5, "PRESENT"));
                }
            }
        }

        // Today's attendance:
        // Aarav Patel (EMP001) has NOT punched in yet so user can test punch in!
        // Priya Sharma (EMP002) punched in at 09:10 AM
        attendanceRepository.save(new Attendance(employees.get(1), today, LocalTime.of(9, 10), null, 0.0, "PRESENT"));
        // Ananya Iyer (EMP004) punched in at 09:05 AM and checked out at 17:35 PM
        attendanceRepository.save(new Attendance(employees.get(3), today, LocalTime.of(9, 5), LocalTime.of(17, 35), 8.5, "PRESENT"));
        // Neha Kulkarni (EMP006) is ON_LEAVE today
        attendanceRepository.save(new Attendance(employees.get(5), today, null, null, 0.0, "ON_LEAVE"));

        // 6. Create Realistic Sample Leave Requests with Indian Context
        // Request 1: Pending (Rohan Verma - Casual Leave 2 days for Diwali festive function)
        LeaveRequest req1 = new LeaveRequest(employees.get(2), "CASUAL_LEAVE", today.plusDays(3), today.plusDays(4), 2, "Family festive celebration and travel to native hometown");
        req1.setStatus("PENDING");
        req1.setAppliedAt(LocalDateTime.now().minusHours(4));
        leaveRequestRepository.save(req1);

        // Request 2: Pending (Ananya Iyer - Sick Leave 1 day)
        LeaveRequest req2 = new LeaveRequest(employees.get(3), "SICK_LEAVE", today.plusDays(1), today.plusDays(1), 1, "Viral fever and doctor consultation");
        req2.setStatus("PENDING");
        req2.setAppliedAt(LocalDateTime.now().minusHours(2));
        leaveRequestRepository.save(req2);

        // Request 3: Approved (Priya Sharma - Paid Leave 3 days)
        LeaveRequest req3 = new LeaveRequest(employees.get(1), "PAID_LEAVE", today.minusDays(10), today.minusDays(8), 3, "Sister's wedding ceremony in Jaipur");
        req3.setStatus("APPROVED");
        req3.setAppliedAt(LocalDateTime.now().minusDays(15));
        req3.setProcessedAt(LocalDateTime.now().minusDays(14));
        leaveRequestRepository.save(req3);
        // Deduct Priya's paid leave balance (12 - 3 = 9)
        LeaveBalance priyaBal = leaveBalanceRepository.findByEmployeeId(employees.get(1).getId()).get();
        priyaBal.setPaidLeave(priyaBal.getPaidLeave() - 3);
        leaveBalanceRepository.save(priyaBal);

        // Request 4: Rejected (Aditya Nair - Casual Leave 3 days)
        LeaveRequest req4 = new LeaveRequest(employees.get(6), "CASUAL_LEAVE", today.minusDays(6), today.minusDays(4), 3, "Vacation trip to Goa");
        req4.setStatus("REJECTED");
        req4.setRejectionReason("Critical cloud migration and production release scheduled during these dates. Please reschedule.");
        req4.setAppliedAt(LocalDateTime.now().minusDays(9));
        req4.setProcessedAt(LocalDateTime.now().minusDays(8));
        leaveRequestRepository.save(req4);

        // Request 5: Cancelled (Pooja Deshmukh - Casual Leave 1 day)
        LeaveRequest req5 = new LeaveRequest(employees.get(7), "CASUAL_LEAVE", today.minusDays(2), today.minusDays(2), 1, "RTO passport documentation appointment");
        req5.setStatus("CANCELLED");
        req5.setAppliedAt(LocalDateTime.now().minusDays(4));
        req5.setProcessedAt(LocalDateTime.now().minusDays(3));
        leaveRequestRepository.save(req5);

        System.out.println(">>> Indian Workforce Seed Data successfully initialized!");
    }

    private Employee createSampleEmp(String code, String name, String email, String phone, String gender,
                                    LocalDate dob, Department dept, String designation, LocalDate joinDate,
                                    String address, BigDecimal salary) {
        User user = new User(email, "employee123", "EMPLOYEE");
        user = userRepository.save(user);

        Employee emp = new Employee();
        emp.setEmployeeCode(code);
        emp.setFullName(name);
        emp.setEmail(email);
        emp.setPhone(phone);
        emp.setGender(gender);
        emp.setDateOfBirth(dob);
        emp.setDepartment(dept);
        emp.setDesignation(designation);
        emp.setJoiningDate(joinDate);
        emp.setAddress(address);
        emp.setSalary(salary);
        emp.setStatus("ACTIVE");
        emp.setUser(user);

        return employeeRepository.save(emp);
    }
}
