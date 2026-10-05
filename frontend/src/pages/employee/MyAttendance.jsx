import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import StatusBadge from '../../components/StatusBadge';

const MyAttendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAttendanceData = async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    setError('');
    try {
      const [list, today] = await Promise.all([
        attendanceService.getAttendanceByEmployee(user.employeeId),
        attendanceService.getTodayAttendance(user.employeeId),
      ]);
      setAttendance(list);
      setTodayRecord(today);
    } catch (err) {
      setError(err.message || 'Error fetching attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user?.employeeId) return;
    setActionLoading(true);
    setMsg('');
    try {
      await attendanceService.checkIn(user.employeeId);
      setMsg('Checked in successfully!');
      fetchAttendanceData();
    } catch (err) {
      setMsg(err.message || 'Error checking in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.employeeId) return;
    setActionLoading(true);
    setMsg('');
    try {
      await attendanceService.checkOut(user.employeeId);
      setMsg('Checked out successfully!');
      fetchAttendanceData();
    } catch (err) {
      setMsg(err.message || 'Error checking out');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">My Attendance & Work Status</h4>
          <p className="text-muted small m-0">Log your daily working hours, punch times, and review past attendance records</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5"
          onClick={fetchAttendanceData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="alert alert-danger mb-3 py-2">{error}</div>}

      {/* Punch Action Widget */}
      <div className="custom-card p-4 mb-4">
        <div className="row align-items-center g-3">
          <div className="col-12 col-md-7">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-primary-subtle text-primary rounded-3">
                <Clock size={30} />
              </div>
              <div>
                <div className="text-muted small">Today's Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <h5 className="fw-bold text-dark m-0">
                    Status:{' '}
                    {todayRecord?.status ? (
                      <StatusBadge status={todayRecord.status} />
                    ) : (
                      <span className="badge bg-secondary-subtle text-secondary">Not Checked In</span>
                    )}
                  </h5>
                </div>
                <div className="small text-secondary mt-1">
                  Punch In: <strong>{todayRecord?.checkIn ? todayRecord.checkIn.slice(0, 5) : '--:--'}</strong> &bull; Punch Out: <strong>{todayRecord?.checkOut ? todayRecord.checkOut.slice(0, 5) : '--:--'}</strong> &bull; Hours: <strong>{todayRecord?.workingHours ? `${todayRecord.workingHours} hrs` : '--'}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-5 d-flex flex-column align-items-md-end gap-2">
            {msg && <div className="text-info small fw-semibold">{msg}</div>}

            <div className="d-flex gap-2 w-100 justify-content-md-end">
              {!todayRecord?.checkIn ? (
                <button
                  type="button"
                  className="btn btn-primary px-4 py-2 d-inline-flex align-items-center gap-2"
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                >
                  <Clock size={18} />
                  <span>{actionLoading ? 'Recording...' : 'Punch In Now'}</span>
                </button>
              ) : !todayRecord?.checkOut ? (
                <button
                  type="button"
                  className="btn btn-warning px-4 py-2 d-inline-flex align-items-center gap-2"
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                >
                  <Clock size={18} />
                  <span>{actionLoading ? 'Recording...' : 'Punch Out (End Day)'}</span>
                </button>
              ) : (
                <div className="badge bg-success-subtle text-success p-2.5 d-flex align-items-center gap-2 fs-6">
                  <CheckCircle2 size={18} />
                  <span>Day Completed ({todayRecord.workingHours} hrs)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Attendance History Table */}
      <div className="custom-card">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <span>Attendance History Log</span>
          </h6>
          <span className="badge bg-light text-secondary border">
            {attendance.length} Record{attendance.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="table-responsive">
          <table className="table custom-table mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th className="text-center">Check In</th>
                <th className="text-center">Check Out</th>
                <th className="text-center">Working Hours</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    <span className="text-muted small">Loading records...</span>
                  </td>
                </tr>
              ) : attendance.length > 0 ? (
                attendance.map((att) => (
                  <tr key={att.id}>
                    <td className="fw-semibold text-dark">{att.attendanceDate}</td>
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
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No attendance records logged yet.
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

export default MyAttendance;
