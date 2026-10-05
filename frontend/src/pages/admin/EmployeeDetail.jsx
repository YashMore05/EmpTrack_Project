import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  DollarSign,
  User,
  Clock,
  PieChart
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { leaveBalanceService } from '../../services/leaveBalanceService';
import { attendanceService } from '../../services/attendanceService';
import { leaveService } from '../../services/leaveService';
import StatusBadge from '../../components/StatusBadge';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [balance, setBalance] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const emp = await employeeService.getEmployeeById(id);
        setEmployee(emp);

        const bal = await leaveBalanceService.getLeaveBalance(id);
        setBalance(bal);

        const att = await attendanceService.getAttendanceByEmployee(id);
        setAttendance(att.slice(0, 10));

        const lvs = await leaveService.getLeavesByEmployee(id);
        setLeaves(lvs);
      } catch (err) {
        setError(err.message || 'Error loading employee details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="alert alert-danger">
        {error || 'Employee not found'}
        <div className="mt-2">
          <Link to="/admin/employees" className="btn btn-sm btn-outline-danger">
            Back to Employee Directory
          </Link>
        </div>
      </div>
    );
  }

  const initials = employee.fullName
    ? employee.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'EMP';

  return (
    <div>
      {/* Back button */}
      <div className="mb-3">
        <Link to="/admin/employees" className="text-decoration-none text-secondary small d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} />
          <span>Back to Employees</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="custom-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="avatar avatar-lg bg-primary text-white fw-bold shadow-sm">
              {initials}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold m-0 text-dark">{employee.fullName}</h4>
                <StatusBadge status={employee.status} />
              </div>
              <p className="text-muted m-0 small mt-0.5">
                {employee.designation} &bull; <span className="fw-semibold text-dark">{employee.departmentName}</span>
              </p>
              <div className="badge bg-light text-secondary border font-monospace mt-1">
                {employee.employeeCode}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="row g-4 mb-4">
        {/* Personal & Employment Info */}
        <div className="col-12 col-lg-8">
          <div className="custom-card p-4 h-100">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Employment Details</h6>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Mail size={16} />
                  <span>Email Address</span>
                </div>
                <div className="fw-semibold text-dark">{employee.email}</div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Phone size={16} />
                  <span>Phone Number</span>
                </div>
                <div className="fw-semibold text-dark">{employee.phone || 'Not provided'}</div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Building size={16} />
                  <span>Department</span>
                </div>
                <div className="fw-semibold text-dark">{employee.departmentName}</div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Briefcase size={16} />
                  <span>Designation</span>
                </div>
                <div className="fw-semibold text-dark">{employee.designation}</div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Calendar size={16} />
                  <span>Joining Date</span>
                </div>
                <div className="fw-semibold text-dark">{employee.joiningDate}</div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <User size={16} />
                  <span>Gender / DOB</span>
                </div>
                <div className="fw-semibold text-dark">
                  {employee.gender || 'Not specified'} {employee.dateOfBirth ? `(Born: ${employee.dateOfBirth})` : ''}
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <DollarSign size={16} />
                  <span>Annual Base Salary</span>
                </div>
                <div className="fw-semibold text-dark">
                  {employee.salary ? `₹${Number(employee.salary).toLocaleString('en-IN')} / annum` : 'Confidential'}
                </div>
              </div>

              <div className="col-12">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <MapPin size={16} />
                  <span>Residential Address</span>
                </div>
                <div className="fw-semibold text-dark">{employee.address || 'No address registered'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Balances Card */}
        <div className="col-12 col-lg-4">
          <div className="custom-card p-4 h-100">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center gap-2">
              <PieChart size={18} className="text-primary" />
              <span>Available Leave Quotas</span>
            </h6>

            <div className="d-flex flex-column gap-3 mt-3">
              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark">Casual Leave</div>
                  <div className="text-muted small">Standard allowance: 8/yr</div>
                </div>
                <span className="badge bg-info text-dark fs-6 px-3 py-1.5">
                  {balance?.casualLeave ?? 0} days
                </span>
              </div>

              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark">Sick Leave</div>
                  <div className="text-muted small">Medical coverage: 6/yr</div>
                </div>
                <span className="badge bg-warning text-dark fs-6 px-3 py-1.5">
                  {balance?.sickLeave ?? 0} days
                </span>
              </div>

              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark">Paid Leave</div>
                  <div className="text-muted small">Earned annual: 12/yr</div>
                </div>
                <span className="badge bg-primary fs-6 px-3 py-1.5">
                  {balance?.paidLeave ?? 0} days
                </span>
              </div>

              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark">Unpaid Leave</div>
                  <div className="text-muted small">Uncapped days taken</div>
                </div>
                <span className="badge bg-secondary fs-6 px-3 py-1.5">
                  {balance?.unpaidLeave ?? 0} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance & Leave Records Tabs */}
      <div className="row g-4">
        {/* Recent Attendance */}
        <div className="col-12 col-xl-6">
          <div className="custom-card p-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Clock size={18} className="text-primary" />
              <span>Recent Attendance Logs</span>
            </h6>

            <div className="table-responsive">
              <table className="table custom-table mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="text-center">In / Out</th>
                    <th className="text-center">Hours</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map((att) => (
                      <tr key={att.id}>
                        <td className="fw-semibold text-dark">{att.attendanceDate}</td>
                        <td className="text-center small font-monospace text-secondary">
                          {att.checkIn ? att.checkIn.slice(0, 5) : '--:--'} &bull; {att.checkOut ? att.checkOut.slice(0, 5) : '--:--'}
                        </td>
                        <td className="text-center fw-semibold text-dark">
                          {att.workingHours ? `${att.workingHours} hrs` : '-'}
                        </td>
                        <td className="text-center">
                          <StatusBadge status={att.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">
                        No attendance records recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leave Requests History */}
        <div className="col-12 col-xl-6">
          <div className="custom-card p-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span>Leave History</span>
            </h6>

            <div className="table-responsive">
              <table className="table custom-table mb-0">
                <thead>
                  <tr>
                    <th className="text-center">Type</th>
                    <th className="text-center">Period</th>
                    <th className="text-center">Days</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length > 0 ? (
                    leaves.map((l) => (
                      <tr key={l.id}>
                        <td className="text-center">
                          <StatusBadge status={l.leaveType} />
                        </td>
                        <td className="text-center small font-monospace text-secondary">
                          {l.startDate} &rarr; {l.endDate}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border font-monospace px-2 py-0.5">{l.numberOfDays}d</span>
                        </td>
                        <td className="text-center">
                          <StatusBadge status={l.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">
                        No leave requests applied yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
