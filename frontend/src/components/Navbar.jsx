import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  LogOut,
  Clock,
  CheckCircle2,
  Bell,
  Check,
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { attendanceService } from '../services/attendanceService';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isEmployee, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attLoading, setAttLoading] = useState(false);
  const [attError, setAttError] = useState('');
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: user?.role === 'ADMIN' ? 'Leave Request: Priya Sharma' : 'Leave Approved',
      time: '10m ago',
      desc: user?.role === 'ADMIN' ? 'Applied for 2 days Casual Leave.' : 'Your Casual Leave application was approved.',
      unread: true,
    },
    {
      id: 2,
      title: 'Attendance Auto-Sync',
      time: '1h ago',
      desc: 'Daily punch logs synchronized with HRMS database.',
      unread: true,
    },
    {
      id: 3,
      title: 'Upcoming Public Holiday',
      time: 'Yesterday',
      desc: 'Office will remain closed on upcoming festival holiday.',
      unread: false,
    },
  ]);

  const notifRef = useRef(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTodayAttendance = async () => {
    if (isEmployee && user?.employeeId) {
      try {
        const att = await attendanceService.getTodayAttendance(user.employeeId);
        setTodayAttendance(att);
      } catch (err) {
        console.error('Error fetching attendance:', err);
      }
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user?.employeeId) return;
    setAttLoading(true);
    setAttError('');
    try {
      const updated = await attendanceService.checkIn(user.employeeId);
      setTodayAttendance(updated);
    } catch (err) {
      setAttError(err.message);
      setTimeout(() => setAttError(''), 4000);
    } finally {
      setAttLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.employeeId) return;
    setAttLoading(true);
    setAttError('');
    try {
      const updated = await attendanceService.checkOut(user.employeeId);
      setTodayAttendance(updated);
    } catch (err) {
      setAttError(err.message);
      setTimeout(() => setAttError(''), 4000);
    } finally {
      setAttLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const firstName = user?.role === 'ADMIN' ? 'Admin' : (user?.fullName ? user.fullName.split(' ')[0] : 'User');

  const initials = user?.role === 'ADMIN'
    ? 'AD'
    : (user?.fullName
        ? user.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'U');

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark fs-6">
              {getGreeting()}, {firstName}! 👋
            </span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-none d-sm-inline" style={{ fontSize: '0.72rem' }}>
              {user?.role === 'ADMIN' ? 'HR Portal' : 'Self-Service'}
            </span>
          </div>
          <div className="text-muted d-none d-md-block" style={{ fontSize: '0.785rem' }}>
            EmpTrack Enterprise &bull; IST Live Environment
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2.5">
        {/* Live IST Clock */}
        <div className="d-none d-xl-flex align-items-center gap-2 px-3 bg-light rounded-pill border small" style={{ height: '38px' }}>
          <Clock size={14} className="text-primary" />
          <span className="fw-semibold text-secondary font-monospace" style={{ fontSize: '0.825rem' }}>
            {currentTime} IST
          </span>
        </div>

        {/* Quick Attendance Action for Employee */}
        {isEmployee && (
          <div className="d-none d-md-flex align-items-center gap-2">
            {attError && <span className="text-danger small">{attError}</span>}
            {!todayAttendance?.checkIn ? (
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-1.5 px-3 shadow-sm"
                style={{ height: '38px', fontSize: '0.85rem' }}
                onClick={handleCheckIn}
                disabled={attLoading}
              >
                <span className="pulse-dot" />
                <span>{attLoading ? 'Punching In...' : 'Punch In Today'}</span>
              </button>
            ) : !todayAttendance?.checkOut ? (
              <button
                type="button"
                className="btn btn-warning d-flex align-items-center gap-1.5 px-3 shadow-sm"
                style={{ height: '38px', fontSize: '0.85rem' }}
                onClick={handleCheckOut}
                disabled={attLoading}
              >
                <Clock size={15} />
                <span>{attLoading ? 'Punching Out...' : 'Punch Out'}</span>
              </button>
            ) : (
              <span className="badge bg-success-subtle text-success border border-success-subtle d-flex align-items-center gap-1.5 px-3" style={{ height: '38px', fontSize: '0.825rem' }}>
                <CheckCircle2 size={14} /> Completed ({todayAttendance.workingHours} hrs)
              </span>
            )}
          </div>
        )}

        {/* Notifications Dropdown (Admin Only) */}
        {isAdmin && (
          <div className="position-relative" ref={notifRef}>
            <button
              type="button"
              className="btn btn-light border position-relative p-2 rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '38px', height: '38px' }}
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={17} className="text-secondary" />
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.65rem', padding: '0.25rem 0.45rem' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-4 border p-0 overflow-hidden"
                style={{ width: '320px', zIndex: 1000, animation: 'slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                  <div className="fw-bold small text-dark">Notifications</div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="btn btn-link text-primary p-0 small text-decoration-none"
                      style={{ fontSize: '0.75rem' }}
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="p-0" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 border-bottom small ${n.unread ? 'bg-primary-subtle bg-opacity-25' : ''}`}
                      style={{ transition: 'background-color 0.2s' }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark" style={{ fontSize: '0.82rem' }}>
                          {n.title}
                        </strong>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {n.time}
                        </span>
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.78rem' }}>
                        {n.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Pill */}
        <div className="d-flex align-items-center gap-2.5 ps-2 border-start">
          <div className="avatar" style={{ width: '38px', height: '38px', fontSize: '0.82rem' }}>
            {initials}
          </div>
          <div className="d-none d-md-block text-start leading-tight">
            <div className="fw-bold small text-dark">{user?.role === 'ADMIN' ? 'Admin' : (user?.fullName || user?.email)}</div>
            <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.74rem' }}>
              <span className={`badge ${user?.role === 'ADMIN' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'} border small py-0.5 px-1.5`}>
                {user?.role === 'ADMIN' ? 'HR Head' : 'Employee'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="btn btn-outline-danger d-flex align-items-center gap-1.5 px-2.5"
          style={{ height: '38px', fontSize: '0.825rem' }}
          onClick={handleLogout}
          title="Sign out of system"
        >
          <LogOut size={15} />
          <span className="d-none d-sm-inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

