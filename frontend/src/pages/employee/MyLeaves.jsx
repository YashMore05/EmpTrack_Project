import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, FilePlus2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { leaveService } from '../../services/leaveService';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';

const MyLeaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetLeave, setTargetLeave] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchMyLeaves = async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    setError('');
    try {
      const data = await leaveService.getLeavesByEmployee(user.employeeId);
      setLeaves(data);
    } catch (err) {
      setError(err.message || 'Error fetching leave records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, [user]);

  const openCancelModal = (leave) => {
    setTargetLeave(leave);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetLeave || !user?.employeeId) return;
    setCancelLoading(true);
    try {
      await leaveService.cancelLeave(targetLeave.id, user.employeeId);
      setCancelModalOpen(false);
      fetchMyLeaves();
    } catch (err) {
      alert(err.message || 'Error cancelling leave request');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">My Leave Applications</h4>
          <p className="text-muted small m-0">Track application statuses, admin review comments, or withdraw pending requests</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/employee/apply-leave" className="btn btn-primary d-inline-flex align-items-center gap-1.5">
            <FilePlus2 size={16} />
            <span>Apply Leave</span>
          </Link>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            onClick={fetchMyLeaves}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3 py-2">{error}</div>}

      {/* Table */}
      <div className="custom-card">
        <div className="table-responsive">
          <table className="table custom-table mb-0">
            <thead>
              <tr>
                <th className="text-center">Leave Type</th>
                <th className="text-center">Dates</th>
                <th className="text-center">Duration</th>
                <th>Reason</th>
                <th className="text-center">Applied Date</th>
                <th className="text-center">Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    <span className="text-muted small">Loading leave records...</span>
                  </td>
                </tr>
              ) : leaves.length > 0 ? (
                leaves.map((l) => (
                  <tr key={l.id}>
                    <td className="text-center">
                      <StatusBadge status={l.leaveType} />
                    </td>
                    <td className="text-center small font-monospace text-secondary">
                      {l.startDate} &rarr; {l.endDate}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border font-monospace px-2 py-0.5">
                        {l.numberOfDays}d
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div className="small text-dark text-truncate" title={l.reason}>
                        {l.reason}
                      </div>
                      {l.rejectionReason && (
                        <div className="small text-danger mt-1 p-1.5 bg-danger-subtle rounded-1">
                          <strong>Admin Reason:</strong> {l.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="text-center small font-monospace text-muted">
                      {l.appliedAt ? l.appliedAt.slice(0, 10) : '-'}
                    </td>
                    <td className="text-center">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="text-end">
                      {l.status === 'PENDING' ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                          onClick={() => openCancelModal(l)}
                          title="Withdraw / Cancel Leave Request"
                        >
                          <XCircle size={14} />
                          <span>Cancel</span>
                        </button>
                      ) : (
                        <span className="text-muted small">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No leave requests found. Click "Apply Leave" to submit your first request.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Pending Leave Application"
        message={`Are you sure you want to cancel your ${targetLeave?.leaveType} request for ${targetLeave?.startDate} to ${targetLeave?.endDate} (${targetLeave?.numberOfDays} days)?`}
        confirmText="Yes, Cancel Request"
        confirmVariant="danger"
        loading={cancelLoading}
      />
    </div>
  );
};

export default MyLeaves;
