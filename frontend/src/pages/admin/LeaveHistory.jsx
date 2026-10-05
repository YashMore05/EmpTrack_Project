import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Calendar, RotateCcw } from 'lucide-react';
import { leaveService } from '../../services/leaveService';
import { employeeService } from '../../services/employeeService';
import StatusBadge from '../../components/StatusBadge';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedEmp) params.employeeId = selectedEmp;
      if (selectedType) params.leaveType = selectedType;
      if (selectedStatus) params.status = selectedStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await leaveService.getAllLeaves(params);
      setLeaves(data);
    } catch (err) {
      setError(err.message || 'Error fetching leave history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadEmps = async () => {
      try {
        const emps = await employeeService.getAllEmployees();
        setEmployees(emps);
      } catch (err) {
        console.error('Error fetching employees', err);
      }
    };
    loadEmps();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [selectedEmp, selectedType, selectedStatus, startDate, endDate]);

  const handleReset = () => {
    setSelectedEmp('');
    setSelectedType('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">Leave History & Audit Trail</h4>
          <p className="text-muted small m-0">Comprehensive record of all employee leave applications, statuses, and decisions</p>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3 py-2">{error}</div>}

      {/* Filter Bar */}
      <div className="custom-card p-3 mb-4">
        <div className="row g-2.5 align-items-end">
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

          <div className="col-12 col-sm-6 col-md-3 col-lg-2">
            <label className="form-label small fw-semibold text-secondary mb-1">Leave Type</label>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="CASUAL_LEAVE">Casual Leave</option>
              <option value="SICK_LEAVE">Sick Leave</option>
              <option value="PAID_LEAVE">Paid Leave</option>
              <option value="UNPAID_LEAVE">Unpaid Leave</option>
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-3 col-lg-2">
            <label className="form-label small fw-semibold text-secondary mb-1">Status</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-3 col-lg-2">
            <label className="form-label small fw-semibold text-secondary mb-1">From Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-3 col-lg-2">
            <label className="form-label small fw-semibold text-secondary mb-1">To Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-3 col-lg-1">
            <label className="form-label small fw-semibold text-secondary mb-1 d-none d-lg-block">&nbsp;</label>
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={handleReset}
              title="Reset Filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="custom-card">
        <div className="table-responsive">
          <table className="table custom-table mb-0">
            <thead>
              <tr>
                <th>Employee</th>
                <th className="text-center">Leave Type</th>
                <th className="text-center">Dates</th>
                <th className="text-center">Duration</th>
                <th>Reason</th>
                <th className="text-center">Status</th>
                <th className="text-center">Applied Date</th>
                <th className="text-center">Reviewed Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    <span className="text-muted small">Loading history logs...</span>
                  </td>
                </tr>
              ) : leaves.length > 0 ? (
                leaves.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div className="fw-semibold text-dark">{l.employeeName}</div>
                      <div className="text-muted small">
                        {l.employeeCode} &bull; {l.departmentName}
                      </div>
                    </td>
                    <td className="text-center">
                      <StatusBadge status={l.leaveType} />
                    </td>
                    <td className="text-center small font-monospace text-secondary">
                      {l.startDate} &rarr; {l.endDate}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                        {l.numberOfDays} d
                      </span>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div className="small text-dark text-truncate" title={l.reason}>
                        {l.reason}
                      </div>
                      {l.rejectionReason && (
                        <div className="small text-danger text-truncate mt-0.5" title={l.rejectionReason}>
                          <strong>Reason:</strong> {l.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="text-center small font-monospace text-muted">
                      {l.appliedAt ? l.appliedAt.slice(0, 10) : '-'}
                    </td>
                    <td className="text-center small font-monospace text-muted">
                      {l.processedAt ? l.processedAt.slice(0, 10) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No leave history records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;
