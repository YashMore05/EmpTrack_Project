import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  History,
  Building2,
  User,
  FilePlus2,
  PieChart,
  LogOut,
  Briefcase,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav = [
    { label: 'HR Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Staff Directory', path: '/admin/employees', icon: Users },
    { label: 'Attendance Logs', path: '/admin/attendance', icon: CalendarCheck },
    { label: 'Leave Approvals', path: '/admin/leave-requests', icon: CalendarDays, badge: 'Review' },
    { label: 'Leave Audit Trail', path: '/admin/leave-history', icon: History },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
  ];

  const employeeNav = [
    { label: 'My Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/employee/profile', icon: User },
    { label: 'My Attendance', path: '/employee/attendance', icon: CalendarCheck },
    { label: 'Apply for Leave', path: '/employee/apply-leave', icon: FilePlus2 },
    { label: 'My Leave Requests', path: '/employee/leaves', icon: CalendarDays },
    { label: 'Leave Quotas', path: '/employee/leave-balance', icon: PieChart },
  ];

  const navItems = isAdmin ? adminNav : employeeNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop d-lg-none" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div
            className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Briefcase size={22} />
          </div>
          <div className="leading-tight">
            <div className="d-flex align-items-center gap-1.5">
              <span className="fw-extrabold text-white" style={{ fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                EmpTrack
              </span>
              <span className="badge bg-primary text-white border border-primary-subtle" style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem' }}>
                PRO
              </span>
            </div>
            <div className="text-secondary small fw-medium" style={{ fontSize: '0.74rem' }}>
              Workforce Management
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <ul className="sidebar-nav">
          <li className="sidebar-section-title">
            {isAdmin ? 'Administration Portal' : 'Self-Service Portal'}
          </li>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="sidebar-nav-item">
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="badge bg-white bg-opacity-15 text-white border border-white border-opacity-25"
                      style={{ fontSize: '0.65rem', padding: '0.2rem 0.45rem' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* User Card & Logout in Footer */}
        <div className="sidebar-footer">
          <div className="d-flex align-items-center gap-2.5 mb-3">
            <div className="position-relative">
              <div
                className="avatar"
                style={{
                  width: '36px',
                  height: '36px',
                  fontSize: '0.8rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {isAdmin ? 'AD' : (user?.fullName
                  ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'U')}
              </div>
              <span
                className="position-absolute bottom-0 end-0 bg-success border border-dark rounded-circle"
                style={{ width: '9px', height: '9px' }}
                title="Status: Online"
              />
            </div>
            <div className="text-truncate leading-tight flex-grow-1" style={{ minWidth: 0 }}>
              <div className="text-white fw-bold small text-truncate">{isAdmin ? 'Admin' : (user?.fullName || 'User')}</div>
              <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-1.5"
            onClick={handleLogout}
            style={{ fontSize: '0.825rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
