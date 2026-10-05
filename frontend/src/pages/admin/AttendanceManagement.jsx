import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  Search,
  Plus,
  X,
  Clock,
  Building,
  User,
  Download,
  RotateCcw
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';
import StatusBadge from '../../components/StatusBadge';

const AttendanceManagement = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Manual Log Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    attendanceDate: new Date().toISOString().slice(0, 10),
    checkIn: '09:00',
    checkOut: '17:30',
    status: 'PRESENT',
  });

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (selectedEmp) params.employeeId = selectedEmp;
      if (selectedDept) params.departmentId = selectedDept;
      if (selectedStatus) params.status = selectedStatus;

      const data = await attendanceService.getAttendance(params);
      setAttendanceList(data);
    } catch (err) {
      setError(err.message || 'Error fetching attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [emps, depts] = await Promise.all([
          employeeService.getAllEmployees(),
          departmentService.getAllDepartments(),
        ]);
        setEmployees(emps);
        setDepartments(depts);
        if (emps.length > 0 && !manualForm.employeeId) {
          setManualForm((prev) => ({ ...prev, employeeId: emps[0].id }));
        }
      } catch (err) {
        console.error('Error loading metadata', err);
      }
    };
    loadMetadata();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, selectedEmp, selectedDept, selectedStatus]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      const payload = {
        employeeId: Number(manualForm.employeeId),
        attendanceDate: manualForm.attendanceDate,
        checkIn: manualForm.status === 'ON_LEAVE' || manualForm.status === 'ABSENT' ? null : manualForm.checkIn ? `${manualForm.checkIn}:00` : null,
        checkOut: manualForm.status === 'ON_LEAVE' || manualForm.status === 'ABSENT' ? null : manualForm.checkOut ? `${manualForm.checkOut}:00` : null,
        status: manualForm.status,
      };

      await attendanceService.logManualAttendance(payload);
      setModalOpen(false);
      fetchAttendance();
    } catch (err) {
      setModalError(err.message || 'Error logging attendance');
    } finally {
      setModalLoading(false);
    }
  };

  const exportAttendanceCSV = () => {
    if (attendanceList.length === 0) return;
    const headers = ['Date', 'Employee ID', 'Full Name', 'Department', 'Check In', 'Check Out', 'Working Hours', 'Status'];
    const rows = attendanceList.map((a) => [
      `"${a.attendanceDate || ''}"`,
      `"${a.employeeCode || ''}"`,
      `"${a.employeeName || ''}"`,
      `"${a.departmentName || 'General'}"`,
      `"${a.checkIn || '-'}"`,
      `"${a.checkOut || '-'}"`,
      `"${a.workingHours || 0}"`,
      `"${a.status || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `EmpTrack_Attendance_Log_${selectedDate || 'all'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold text-dark m-0">Workforce Attendance</h4>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.72rem' }}>
              {attendanceList.length} Records
            </span>
          </div>
          <p className="text-muted small m-0 mt-0.5">Monitor daily punch-in, checkout logs, working hours, and work statuses</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5"
            onClick={exportAttendanceCSV}
            disabled={attendanceList.length === 0}
            title="Export attendance records to CSV"
          >
            <Download size={16} />
            <span className="d-none d-sm-inline">Export CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm"
            onClick={() => {
              setModalError('');
              setModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Manual Entry / Adjust</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3 py-2">{error}</div>}

      {/* Filter Bar */}
      <div className="custom-card p-3 mb-4">
        <div className="row g-2.5 align-items-end">
          {/* Date Picker */}
          <div className="col-12 col-sm-6 col-md-3 col-lg-2">
            <label className="form-label small fw-semibold text-secondary mb-1">Attendance Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Employee Filter */}
          <div className="col-12 col-sm-6 col-md-3 col-lg-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Employee</label>
            <select
              className="form-select"
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="col-12 col-sm-6 col-md-3 col-lg-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Department</label>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-12 col-sm-6 col-md-3 col-lg-2">
            <label className="form-label small fw-semibold text-secondary mb-1">Status</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="col-12 col-sm-12 col-md-12 col-lg-2">
            <label className="form-label small fw-semibold text-secondary mb-1 d-none d-lg-block">&nbsp;</label>
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSelectedDate('');
                setSelectedEmp('');
                setSelectedDept('');
                setSelectedStatus('');
              }}
              title="Reset Filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="custom-card">
        <div className="table-responsive">
          <table className="table custom-table mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th className="text-center">Employee ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th className="text-center">Check In</th>
                <th className="text-center">Check Out</th>
                <th className="text-center">Working Hours</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    <span className="text-muted small">Loading attendance logs...</span>
                  </td>
                </tr>
              ) : attendanceList.length > 0 ? (
                attendanceList.map((att) => (
                  <tr key={att.id}>
                    <td className="fw-semibold text-dark">{att.attendanceDate}</td>
                    <td className="text-center">
                      <span className="badge bg-light text-secondary border font-monospace">
                        {att.employeeCode}
                      </span>
                    </td>
                    <td className="fw-semibold text-dark">{att.employeeName}</td>
                    <td className="text-secondary">{att.departmentName}</td>
                    <td className="text-center small font-monospace text-secondary">
                      {att.checkIn ? att.checkIn.slice(0, 5) : '--:--'}
                    </td>
                    <td className="text-center small font-monospace text-secondary">
                      {att.checkOut ? att.checkOut.slice(0, 5) : '--:--'}
                    </td>
                    <td className="text-center fw-semibold text-dark">
                      {att.workingHours !== null && att.workingHours !== undefined
                        ? `${att.workingHours} hrs`
                        : '--'}
                    </td>
                    <td className="text-center">
                      <StatusBadge status={att.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No attendance records found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Entry Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header-custom">
              <h5 className="m-0 fw-bold">Manual Attendance Adjustment</h5>
              <button
                type="button"
                className="btn btn-sm btn-light border-0 p-1"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit}>
              <div className="modal-body-custom">
                {modalError && <div className="alert alert-danger py-2 small mb-3">{modalError}</div>}

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Employee *</label>
                  <select
                    className="form-select"
                    value={manualForm.employeeId}
                    onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeCode}) - {emp.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Attendance Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={manualForm.attendanceDate}
                    onChange={(e) => setManualForm({ ...manualForm, attendanceDate: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Attendance Status *</label>
                  <select
                    className="form-select"
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                    required
                  >
                    <option value="PRESENT">Present</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>

                {manualForm.status !== 'ON_LEAVE' && manualForm.status !== 'ABSENT' && (
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Check In Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={manualForm.checkIn}
                        onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Check Out Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={manualForm.checkOut}
                        onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setModalOpen(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
