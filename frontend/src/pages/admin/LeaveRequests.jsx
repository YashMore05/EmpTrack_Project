import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  RefreshCw,
  Clock
} from 'lucide-react';
import { leaveService } from '../../services/leaveService';
import StatusBadge from '../../components/StatusBadge';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Filter tab: 'PENDING' vs 'ALL'
  const [activeTab, setActiveTab] = useState('PENDING');

  const fetchLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (activeTab === 'PENDING') {
        params.status = 'PENDING';
      }
      const data = await leaveService.getAllLeaves(params);
      setLeaves(data);
    } catch (err) {
      setError(err.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [activeTab]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await leaveService.approveLeave(id);
      fetchLeaves();
    } catch (err) {
      alert(err.message || 'Error approving leave');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (leave) => {
    setSelectedLeave(leave);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedLeave) return;
    setActionLoading(true);
    try {
      await leaveService.rejectLeave(selectedLeave.id, rejectionReason);
      setRejectModalOpen(false);
      fetchLeaves();
    } catch (err) {
      alert(err.message || 'Error rejecting leave');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">Leave Approvals Queue</h4>
          <p className="text-muted small m-0">Review pending employee leave requests, approve quotas, or submit rejections</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5"
          onClick={fetchLeaves}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {error && <div className="alert alert-danger mb-3 py-2">{error}</div>}

      {/* Tabs */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'PENDING' ? 'btn-primary' : 'btn-light border text-secondary'}`}
          onClick={() => setActiveTab('PENDING')}
        >
          <span>Pending Review</span>
          {activeTab === 'PENDING' && leaves.length > 0 && (
            <span className="badge bg-white text-primary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
              {leaves.length}
            </span>
          )}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-light border text-secondary'}`}
          onClick={() => setActiveTab('ALL')}
        >
          <span>All Applications</span>
        </button>
      </div>

      {/* Table */}
      <div className="custom-card">
        <div className="table-responsive">
          <table className="table custom-table mb-0">
            <thead>
              <tr>
                <th>Applicant</th>
                <th className="text-center">Leave Type</th>
                <th className="text-center">Start Date</th>
                <th className="text-center">End Date</th>
                <th className="text-center">Duration</th>
                <th>Reason</th>
                <th className="text-center">Status</th>
                <th className="text-center">Applied Date</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    <span className="text-muted small">Loading leave requests...</span>
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
                    <td className="text-center small font-monospace text-secondary">{l.startDate}</td>
                    <td className="text-center small font-monospace text-secondary">{l.endDate}</td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                        {l.numberOfDays} day{l.numberOfDays > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div className="small text-dark text-truncate" title={l.reason}>
                        {l.reason}
                      </div>
                      {l.rejectionReason && (
                        <div className="small text-danger text-truncate mt-1" title={l.rejectionReason}>
                          <strong>Rejection reason:</strong> {l.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="text-center small font-monospace text-muted">
                      {l.appliedAt ? l.appliedAt.slice(0, 10) : ''}
                    </td>
                    <td className="text-end">
                      {l.status === 'PENDING' ? (
                        <div className="d-inline-flex align-items-center justify-content-end gap-1.5">
                          <button
                            type="button"
                            className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                            onClick={() => handleApprove(l.id)}
                            disabled={actionLoading}
                            title="Approve Leave and Deduct Balance"
                          >
                            <CheckCircle size={14} />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                            onClick={() => openRejectModal(l)}
                            disabled={actionLoading}
                            title="Reject Leave"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
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
                  <td colSpan="9" className="text-center py-5 text-muted">
                    No leave applications found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <div className="modal-header-custom">
              <h5 className="m-0 fw-bold text-danger d-flex align-items-center gap-2">
                <AlertCircle size={20} />
                <span>Reject Leave Request</span>
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-light border-0 p-1"
                onClick={() => setRejectModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body-custom">
              <div className="p-3 bg-light rounded-3 mb-3 small">
                <div>
                  <strong>Applicant:</strong> {selectedLeave?.employeeName} ({selectedLeave?.employeeCode})
                </div>
                <div>
                  <strong>Leave Type:</strong> {selectedLeave?.leaveType} ({selectedLeave?.numberOfDays} days)
                </div>
                <div>
                  <strong>Dates:</strong> {selectedLeave?.startDate} to {selectedLeave?.endDate}
                </div>
              </div>

              <label className="form-label small fw-semibold">
                Reason for Rejection *
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="State the reason why this leave is not approved (e.g. conflicting projects, peak period, insufficient notice)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
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
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
