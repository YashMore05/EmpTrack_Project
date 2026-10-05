import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FilePlus2, Calendar, AlertCircle, CheckCircle2, ArrowLeft, Info } from 'lucide-react';
import { leaveService } from '../../services/leaveService';
import { leaveBalanceService } from '../../services/leaveBalanceService';

const ApplyLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balances, setBalances] = useState(null);
  const [loadingBalances, setLoadingBalances] = useState(true);

  // Form State
  const todayStr = new Date().toISOString().slice(0, 10);
  const [leaveType, setLeaveType] = useState('CASUAL_LEAVE');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reason, setReason] = useState('');

  // UI state
  const [calculatedDays, setCalculatedDays] = useState(1);
  const [validationWarning, setValidationWarning] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.employeeId) return;
      try {
        const bal = await leaveBalanceService.getLeaveBalance(user.employeeId);
        setBalances(bal);
      } catch (err) {
        console.error('Error fetching balance', err);
      } finally {
        setLoadingBalances(false);
      }
    };
    fetchBalance();
  }, [user]);

  // Calculate days & validate balance whenever dates or leaveType change
  useEffect(() => {
    if (!startDate || !endDate) {
      setCalculatedDays(0);
      setValidationWarning('Please select both start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setCalculatedDays(0);
      setValidationWarning('Start date cannot be after end date.');
      return;
    }

    // Number of days inclusive
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setCalculatedDays(diffDays);

    // Validate available balance
    if (balances) {
      let available = 0;
      if (leaveType === 'CASUAL_LEAVE') available = balances.casualLeave;
      else if (leaveType === 'SICK_LEAVE') available = balances.sickLeave;
      else if (leaveType === 'PAID_LEAVE') available = balances.paidLeave;
      else if (leaveType === 'UNPAID_LEAVE') available = 999; // uncapped

      if (leaveType !== 'UNPAID_LEAVE' && diffDays > available) {
        setValidationWarning(
          `Requested duration (${diffDays} days) exceeds your available balance of ${available} day(s) for this leave type.`
        );
      } else {
        setValidationWarning('');
      }
    }
  }, [startDate, endDate, leaveType, balances]);

  const getAvailableDaysForSelected = () => {
    if (!balances) return 0;
    if (leaveType === 'CASUAL_LEAVE') return balances.casualLeave;
    if (leaveType === 'SICK_LEAVE') return balances.sickLeave;
    if (leaveType === 'PAID_LEAVE') return balances.paidLeave;
    if (leaveType === 'UNPAID_LEAVE') return 'Unlimited';
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validationWarning) return;
    if (!reason.trim()) {
      setServerError('Please provide a reason for your leave request.');
      return;
    }

    setServerError('');
    setSubmitting(true);

    try {
      await leaveService.applyLeave({
        employeeId: user.employeeId,
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });

      setSuccessMsg('Your leave application has been submitted successfully for approval!');
      setTimeout(() => {
        navigate('/employee/leaves');
      }, 1500);
    } catch (err) {
      setServerError(err.message || 'Error submitting leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Back button */}
      <div className="mb-3">
        <Link to="/employee/dashboard" className="text-decoration-none text-secondary small d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="custom-card p-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="p-2 bg-primary-subtle text-primary rounded-3">
                <FilePlus2 size={24} />
              </div>
              <h4 className="fw-bold text-dark m-0">Apply for Leave</h4>
            </div>
            <p className="text-muted small mb-4">
              Submit a formal time-off request. Approved leaves are automatically logged in your attendance.
            </p>

            {serverError && <div className="alert alert-danger py-2 small mb-3">{serverError}</div>}
            {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}

            {/* Leave Balance Banner */}
            <div className="p-3 bg-light rounded-3 mb-4">
              <div className="row text-center g-2 small">
                <div className="col-3 border-end">
                  <div className="text-muted">Casual</div>
                  <div className="fw-bold text-dark fs-6">{balances?.casualLeave ?? '-'} d</div>
                </div>
                <div className="col-3 border-end">
                  <div className="text-muted">Sick</div>
                  <div className="fw-bold text-dark fs-6">{balances?.sickLeave ?? '-'} d</div>
                </div>
                <div className="col-3 border-end">
                  <div className="text-muted">Paid</div>
                  <div className="fw-bold text-dark fs-6">{balances?.paidLeave ?? '-'} d</div>
                </div>
                <div className="col-3">
                  <div className="text-muted">Unpaid</div>
                  <div className="fw-bold text-dark fs-6">{balances?.unpaidLeave ?? 0} d</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Leave Type */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Leave Type *</label>
                  <select
                    className="form-select"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    required
                  >
                    <option value="CASUAL_LEAVE">Casual Leave (Available: {balances?.casualLeave ?? 0} days)</option>
                    <option value="SICK_LEAVE">Sick Leave (Available: {balances?.sickLeave ?? 0} days)</option>
                    <option value="PAID_LEAVE">Paid Leave (Available: {balances?.paidLeave ?? 0} days)</option>
                    <option value="UNPAID_LEAVE">Unpaid Leave (Uncapped)</option>
                  </select>
                  <div className="form-text small">
                    Selected category quota balance: <strong>{getAvailableDaysForSelected()}</strong>
                  </div>
                </div>

                {/* Start Date & End Date */}
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>

                {/* Auto Calculated Days Card */}
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="small text-muted">Total Requested Duration:</div>
                      <div className="fw-bold fs-5 text-dark">
                        {calculatedDays} {calculatedDays === 1 ? 'Working Day' : 'Working Days'}
                      </div>
                    </div>
                    {validationWarning ? (
                      <span className="badge bg-danger-subtle text-danger p-2 d-flex align-items-center gap-1">
                        <AlertCircle size={16} /> Exceeds Quota
                      </span>
                    ) : (
                      <span className="badge bg-success-subtle text-success p-2 d-flex align-items-center gap-1">
                        <CheckCircle2 size={16} /> Within Allowance
                      </span>
                    )}
                  </div>
                  {validationWarning && (
                    <div className="text-danger small mt-1.5 d-flex align-items-center gap-1">
                      <AlertCircle size={14} />
                      <span>{validationWarning}</span>
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Reason for Absence *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide a clear description or context for this leave application..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end align-items-center gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => navigate('/employee/dashboard')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={submitting || !!validationWarning || calculatedDays <= 0}
                >
                  {submitting ? 'Submitting...' : 'Apply Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
