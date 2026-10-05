import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  CalendarCheck,
  CalendarDays,
  FilePlus2,
  PieChart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { attendanceService } from '../../services/attendanceService';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attLoading, setAttLoading] = useState(false);
  const [attMessage, setAttMessage] = useState('');
  const [liveTime, setLiveTime] = useState(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getEmployeeDashboard(user.employeeId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user?.employeeId) return;
    setAttLoading(true);
    setAttMessage('');
    try {
      await attendanceService.checkIn(user.employeeId);
      setAttMessage('Checked in successfully!');
      fetchDashboard();
    } catch (err) {
      setAttMessage(err.message || 'Error during check-in');
    } finally {
      setAttLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.employeeId) return;
    setAttLoading(true);
    setAttMessage('');
    try {
      await attendanceService.checkOut(user.employeeId);
      setAttMessage('Checked out successfully!');
      fetchDashboard();
    } catch (err) {
      setAttMessage(err.message || 'Error during check-out');
    } finally {
      setAttLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="custom-card p-3 p-md-4 mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h4 className="fw-extrabold text-dark m-0" style={{ letterSpacing: '-0.02em' }}>
                Welcome Back, {data?.fullName || user?.fullName}!
              </h4>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.72rem' }}>
                Employee Portal
              </span>
            </div>
            <p className="text-muted small m-0">
              {data?.designation} &bull; <span className="fw-semibold text-dark">{data?.departmentName}</span> &bull; ID: <span className="font-monospace fw-semibold">{data?.employeeCode}</span>
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link to="/employee/apply-leave" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm">
              <FilePlus2 size={16} />
              <span>Apply for Leave</span>
            </Link>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
              onClick={fetchDashboard}
              title="Refresh Dashboard"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span className="d-none d-sm-inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4 py-2">{error}</div>}

      {/* Attendance Punch Widget & Summary Card */}
      <div className="row g-3 mb-4">
        {/* Today's Punch Card with Live Clock */}
        <div className="col-12 col-lg-5">
          <div className="custom-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <Clock size={18} className="text-primary" />
                <span>Live Attendance Punch</span>
              </h6>
              <StatusBadge status={data?.todayStatus} />
            </div>

            {/* Live Clock Display */}
            <div className="text-center py-2.5 mb-3 bg-light rounded-3 border">
              <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                Indian Standard Time (IST)
              </div>
              <div className="fs-3 fw-extrabold text-dark font-monospace my-1">
                {liveTime}
              </div>
              <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
                Standard Shift: 09:30 AM &ndash; 06:30 PM
              </div>
            </div>

            <div className="p-3 bg-light rounded-3 mb-3 border">
              <div className="row text-center g-2">
                <div className="col-6 border-end">
                  <div className="text-muted small fw-semibold">Punch In</div>
                  <div className="fw-bold fs-5 text-dark mt-0.5">
                    {data?.todayCheckIn ? data.todayCheckIn.slice(0, 5) : '--:--'}
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-muted small fw-semibold">Punch Out</div>
                  <div className="fw-bold fs-5 text-dark mt-0.5">
                    {data?.todayCheckOut ? data.todayCheckOut.slice(0, 5) : '--:--'}
                  </div>
                </div>
              </div>
            </div>

            {attMessage && (
              <div className="alert alert-info py-1.5 px-3 small mb-3 text-center">
                {attMessage}
              </div>
            )}

            <div className="d-flex gap-2">
              {!data?.todayCheckIn ? (
                <button
                  type="button"
                  className="btn btn-primary w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow-sm fw-bold"
                  onClick={handleCheckIn}
                  disabled={attLoading}
                >
                  <Clock size={18} />
                  <span>{attLoading ? 'Recording...' : 'Punch In Now'}</span>
                </button>
              ) : !data?.todayCheckOut ? (
                <button
                  type="button"
                  className="btn btn-warning text-dark w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow-sm fw-bold"
                  onClick={handleCheckOut}
                  disabled={attLoading}
                >
                  <Clock size={18} />
                  <span>{attLoading ? 'Recording...' : 'Punch Out (End Day)'}</span>
                </button>
              ) : (
                <div className="w-100 py-2.5 bg-success-subtle text-success text-center rounded-3 fw-bold small d-flex align-items-center justify-content-center gap-1.5 border border-success-subtle">
                  <CheckCircle2 size={17} />
                  <span>Attendance completed today ({data?.todayWorkingHours || 0} hrs)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leave Balances Row */}
        <div className="col-12 col-lg-7">
          <div className="row g-3 h-100">
            <div className="col-6 col-sm-3">
              <StatCard
                title="Casual Leave"
                value={data?.casualLeave}
                subtitle="Annual: 8 days"
                icon={PieChart}
                color="info"
              />
            </div>
            <div className="col-6 col-sm-3">
              <StatCard
                title="Sick Leave"
                value={data?.sickLeave}
                subtitle="Medical: 6 days"
                icon={PieChart}
                color="warning"
              />
            </div>
            <div className="col-6 col-sm-3">
              <StatCard
                title="Paid Leave"
                value={data?.paidLeave}
                subtitle="Earned: 12 days"
                icon={PieChart}
                color="primary"
              />
            </div>
            <div className="col-6 col-sm-3">
              <StatCard
                title="Unpaid Leave"
                value={data?.unpaidLeave}
                subtitle="Days taken"
                icon={PieChart}
                color="purple"
              />
            </div>

            {/* Quick alert bar */}
            <div className="col-12">
              <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <CalendarDays size={18} className="text-primary" />
                  <span className="small text-secondary">
                    You currently have <strong className="text-dark">{data?.pendingLeavesCount || 0}</strong> pending leave application(s).
                  </span>
                </div>
                <Link to="/employee/leaves" className="text-decoration-none small fw-semibold text-primary">
                  View My Requests &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recents: Attendance & Leave History */}
      <div className="row g-4">
        {/* Recent Attendance */}
        <div className="col-12 col-lg-6">
          <div className="custom-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <CalendarCheck size={18} className="text-primary" />
                <span>My Recent Attendance</span>
              </h6>
              <Link to="/employee/attendance" className="text-decoration-none small fw-semibold text-primary">
                Full Log &rarr;
              </Link>
            </div>

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
                  {data?.recentAttendance && data.recentAttendance.length > 0 ? (
                    data.recentAttendance.map((att) => (
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
                        No recent attendance records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Leaves */}
        <div className="col-12 col-lg-6">
          <div className="custom-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <CalendarDays size={18} className="text-primary" />
                <span>My Recent Leave Applications</span>
              </h6>
              <Link to="/employee/leaves" className="text-decoration-none small fw-semibold text-primary">
                View All &rarr;
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table custom-table mb-0">
                <thead>
                  <tr>
                    <th className="text-center">Type</th>
                    <th className="text-center">Dates</th>
                    <th className="text-center">Days</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentLeaves && data.recentLeaves.length > 0 ? (
                    data.recentLeaves.map((l) => (
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
                        No recent leave requests.
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

export default EmployeeDashboard;
