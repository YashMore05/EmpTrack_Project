import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  CalendarDays,
  CheckCircle,
  XCircle,
  Building,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  FileText
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { leaveService } from '../../services/leaveService';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getAdminDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await leaveService.approveLeave(id);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Error approving leave');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setSelectedLeaveId(id);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedLeaveId) return;
    setActionLoading(true);
    try {
      await leaveService.rejectLeave(selectedLeaveId, rejectionReason);
      setRejectModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Error rejecting leave');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Banner with Quick Actions */}
      <div className="custom-card p-3 p-md-4 mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h4 className="fw-extrabold text-dark m-0" style={{ letterSpacing: '-0.02em' }}>
                HR & Admin Overview
              </h4>
              <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                <span className="pulse-dot" /> Live System
              </span>
            </div>
            <p className="text-muted small m-0">
              Real-time Indian workforce snapshot &bull; Today is {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <Link
              to="/admin/employees"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm"
            >
              <UserPlus size={15} />
              <span>+ Add Employee</span>
            </Link>
            <Link
              to="/admin/leave-requests"
              className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1.5"
            >
              <CalendarDays size={15} />
              <span>Review Leaves</span>
            </Link>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5"
              onClick={fetchDashboardData}
              disabled={loading}
              title="Refresh Dashboard metrics"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span className="d-none d-sm-inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4 py-2">{error}</div>}

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Total Staff"
            value={data?.totalEmployees}
            icon={Users}
            color="primary"
            subtitle="Across 6 Depts"
            trend="+100%"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Active Workforce"
            value={data?.activeEmployees}
            icon={UserCheck}
            color="success"
            subtitle="Fully Onboarded"
            trend="Active"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="On Leave Today"
            value={data?.onLeaveToday}
            icon={UserX}
            color="info"
            subtitle="Approved Out"
            trend="Tracked"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Pending Leaves"
            value={data?.pendingLeaveRequests}
            icon={CalendarDays}
            color="warning"
            subtitle="Needs Review"
            trend="Action"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Total Approved"
            value={data?.approvedLeaves}
            icon={CheckCircle}
            color="success"
            subtitle="Calendar Synced"
            trend="Passed"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Total Rejected"
            value={data?.rejectedLeaves}
            icon={XCircle}
            color="danger"
            subtitle="Quota Exhausted"
            trend="Audited"
          />
        </div>
      </div>

      {/* Charts & Distribution Section */}
      <div className="row g-3 mb-4">
        {/* Employees by Department */}
        <div className="col-12 col-lg-7">
          <div className="custom-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <Building size={18} className="text-primary" />
                <span>Workforce by Department</span>
              </h6>
              <Link to="/admin/departments" className="text-decoration-none small fw-semibold text-primary">
                Manage Departments &rarr;
              </Link>
            </div>

            <div className="d-flex flex-column gap-3 mt-3">
              {data?.departmentDistribution &&
                Object.entries(data.departmentDistribution).map(([dept, count]) => {
                  const total = data.totalEmployees || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={dept}>
                      <div className="d-flex justify-content-between small fw-semibold mb-1">
                        <span className="text-secondary">{dept}</span>
                        <span className="text-dark">
                          {count} employee{count !== 1 ? 's' : ''} ({pct}%)
                        </span>
                      </div>
                      <div className="progress" style={{ height: '7px' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                          aria-valuenow={pct}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Leave Requests by Status */}
        <div className="col-12 col-lg-5">
          <div className="custom-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <Clock size={18} className="text-warning" />
                <span>Leave Status Breakdown</span>
              </h6>
              <Link to="/admin/leave-history" className="text-decoration-none small fw-semibold text-primary">
                View History &rarr;
              </Link>
            </div>

            <div className="d-flex flex-column gap-2 mt-3">
              {data?.leaveStatusDistribution && (
                <>
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light">
                    <span className="small fw-semibold text-warning-emphasis">Pending Reviews</span>
                    <span className="badge bg-warning text-dark px-2.5 py-1">
                      {data.leaveStatusDistribution['PENDING'] || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light">
                    <span className="small fw-semibold text-success-emphasis">Approved Leaves</span>
                    <span className="badge bg-success px-2.5 py-1">
                      {data.leaveStatusDistribution['APPROVED'] || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light">
                    <span className="small fw-semibold text-danger-emphasis">Rejected Requests</span>
                    <span className="badge bg-danger px-2.5 py-1">
                      {data.leaveStatusDistribution['REJECTED'] || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light">
                    <span className="small fw-semibold text-secondary">Cancelled by Employee</span>
                    <span className="badge bg-secondary px-2.5 py-1">
                      {data.leaveStatusDistribution['CANCELLED'] || 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leave Requests & Today's Attendance */}
      <div className="row g-3">
        {/* Recent Leave Requests */}
        <div className="col-12 col-xl-7">
          <div className="custom-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold m-0 text-dark">Recent Leave Applications</h6>
              <Link to="/admin/leave-requests" className="text-decoration-none small fw-semibold text-primary">
                View All &rarr;
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table custom-table mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th className="text-center">Type</th>
                    <th className="text-center">Dates</th>
                    <th className="text-center">Duration</th>
                    <th className="text-center">Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentLeaveRequests && data.recentLeaveRequests.length > 0 ? (
                    data.recentLeaveRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <div className="fw-semibold text-dark">{req.employeeName}</div>
                          <div className="text-muted small">{req.departmentName}</div>
                        </td>
                        <td className="text-center">
                          <StatusBadge status={req.leaveType} />
                        </td>
                        <td className="text-center small font-monospace text-secondary">
                          {req.startDate} &rarr; {req.endDate}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border font-monospace px-2 py-0.5">{req.numberOfDays}d</span>
                        </td>
                        <td className="text-center">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="text-end">
                          {req.status === 'PENDING' ? (
                            <div className="d-inline-flex align-items-center justify-content-end gap-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-success py-1 px-2 small"
                                onClick={() => handleApprove(req.id)}
                                disabled={actionLoading}
                                title="Approve leave"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger py-1 px-2 small"
                                onClick={() => openRejectModal(req.id)}
                                disabled={actionLoading}
                                title="Reject leave"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted small">&mdash;</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
                        No recent leave requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="col-12 col-xl-5">
          <div className="custom-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold m-0 text-dark">Today's Employee Status</h6>
              <Link to="/admin/attendance" className="text-decoration-none small fw-semibold text-primary">
                Full Log &rarr;
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table custom-table mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th className="text-center">In / Out</th>
                    <th className="text-center">Hours</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentAttendance && data.recentAttendance.length > 0 ? (
                    data.recentAttendance.map((att) => (
                      <tr key={att.id}>
                        <td>
                          <div className="fw-semibold text-dark">{att.employeeName}</div>
                          <div className="text-muted small">{att.employeeCode}</div>
                        </td>
                        <td className="text-center small font-monospace text-secondary">
                          {att.checkIn ? att.checkIn.slice(0, 5) : '--:--'} &bull; {att.checkOut ? att.checkOut.slice(0, 5) : '--:--'}
                        </td>
                        <td className="text-center fw-semibold text-dark">
                          {att.workingHours ? `${att.workingHours}h` : '0h'}
                        </td>
                        <td className="text-center">
                          <StatusBadge status={att.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">
                        No attendance logged yet today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Leave Modal with Reason */}
      {rejectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header-custom">
              <h6 className="m-0 fw-bold text-danger">Reject Leave Application</h6>
              <button
                type="button"
                className="btn btn-sm btn-light border-0 p-1"
                onClick={() => setRejectModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body-custom">
              <p className="text-muted small mb-3">
                Please provide a reason for rejecting this leave request. The employee will see this in their leave portal.
              </p>
              <div className="mb-2">
                <label className="form-label small fw-semibold">Rejection Reason</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="e.g. Critical project deadline, staffing shortage..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer-custom">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
