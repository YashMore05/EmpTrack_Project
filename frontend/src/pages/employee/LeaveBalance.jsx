import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PieChart, FilePlus2, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { leaveBalanceService } from '../../services/leaveBalanceService';

const LeaveBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBalance = async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    setError('');
    try {
      const data = await leaveBalanceService.getLeaveBalance(user.employeeId);
      setBalance(data);
    } catch (err) {
      setError(err.message || 'Error fetching leave balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  // Standard initial quotas: Casual=8, Sick=6, Paid=12
  const quotaCategories = [
    {
      type: 'Casual Leave',
      description: 'For personal errands, family commitments, and unexpected urgent needs.',
      totalQuota: 8,
      remaining: balance?.casualLeave ?? 0,
      used: Math.max(0, 8 - (balance?.casualLeave ?? 0)),
      color: 'info',
    },
    {
      type: 'Sick Leave',
      description: 'For medical care, illness, clinic visits, and health recovery.',
      totalQuota: 6,
      remaining: balance?.sickLeave ?? 0,
      used: Math.max(0, 6 - (balance?.sickLeave ?? 0)),
      color: 'warning',
    },
    {
      type: 'Paid Leave',
      description: 'Annual vacation entitlement earned throughout the employment tenure.',
      totalQuota: 12,
      remaining: balance?.paidLeave ?? 0,
      used: Math.max(0, 12 - (balance?.paidLeave ?? 0)),
      color: 'primary',
    },
    {
      type: 'Unpaid Leave',
      description: 'Additional extended absences outside the standard paid annual leave allotment.',
      totalQuota: 'Uncapped',
      remaining: 'N/A',
      used: balance?.unpaidLeave ?? 0,
      color: 'secondary',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">Leave Quotas & Balances</h4>
          <p className="text-muted small m-0">Track your annual time-off entitlements, utilized days, and remaining allowances</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/employee/apply-leave" className="btn btn-primary d-inline-flex align-items-center gap-1.5">
            <FilePlus2 size={16} />
            <span>Apply for Leave</span>
          </Link>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            onClick={fetchBalance}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3 py-2">{error}</div>}

      {/* Grid of Categories */}
      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          quotaCategories.map((cat) => {
            const isUnpaid = cat.totalQuota === 'Uncapped';
            const pctRemaining = isUnpaid
              ? 100
              : Math.min(100, Math.round((cat.remaining / cat.totalQuota) * 100));

            return (
              <div key={cat.type} className="col-12 col-md-6">
                <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h5 className="fw-bold text-dark m-0">{cat.type}</h5>
                      <span className={`badge bg-${cat.color}-subtle text-${cat.color}-emphasis px-2.5 py-1 fw-bold fs-6`}>
                        {cat.remaining} {typeof cat.remaining === 'number' ? 'Days Left' : ''}
                      </span>
                    </div>

                    <p className="text-muted small mb-3">{cat.description}</p>

                    {!isUnpaid && (
                      <div className="mb-3">
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>Balance: {cat.remaining} / {cat.totalQuota} days</span>
                          <span>{pctRemaining}% remaining</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar bg-${cat.color}`}
                            role="progressbar"
                            style={{ width: `${pctRemaining}%` }}
                            aria-valuenow={pctRemaining}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-top d-flex align-items-center justify-content-between bg-light p-3 rounded-3 mt-2">
                    <div>
                      <div className="small text-muted">Annual Allowance</div>
                      <div className="fw-bold text-dark">{cat.totalQuota} {typeof cat.totalQuota === 'number' ? 'days' : ''}</div>
                    </div>
                    <div className="text-end">
                      <div className="small text-muted">Used / Approved</div>
                      <div className="fw-bold text-secondary">{cat.used} day{cat.used !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeaveBalance;
