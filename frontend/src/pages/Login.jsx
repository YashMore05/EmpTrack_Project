import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  CalendarCheck,
  Users,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickSelect = (role) => {
    setActiveTab(role);
    setError('');
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('aarav.patel@example.com');
      setPassword('employee123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your work email address and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-canvas position-relative overflow-hidden">
      {/* Ambient background blur lights */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.16) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <div className="container position-relative" style={{ maxWidth: '1020px', zIndex: 1 }}>
        <div className="card border-0 shadow-lg rounded-5 overflow-hidden" style={{ border: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <div className="row g-0">
            {/* Left Hero Brand Panel */}
            <div
              className="col-12 col-lg-5 p-4 p-md-5 text-white d-flex flex-column justify-content-between position-relative overflow-hidden"
              style={{
                background: 'linear-gradient(150deg, #090d16 0%, #1e1b4b 45%, #312e81 100%)',
              }}
            >
              {/* Decorative subtle background pattern */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.04,
                  backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  pointerEvents: 'none',
                }}
              />

              <div className="position-relative" style={{ zIndex: 2 }}>
                {/* Brand Header */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="p-2.5 rounded-3 d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    <Briefcase size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h3 className="fw-extrabold m-0 text-white tracking-tight" style={{ fontSize: '1.45rem', letterSpacing: '-0.02em' }}>
                        EmpTrack
                      </h3>
                      <span className="badge bg-white bg-opacity-15 text-white border border-white border-opacity-25" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                        PRO
                      </span>
                    </div>
                    <div className="text-white text-opacity-75 small" style={{ fontSize: '0.785rem' }}>
                      Intelligent Workforce Management
                    </div>
                  </div>
                </div>

                {/* Hero Pitch */}
                <div className="my-4 pt-1">
                  <h4 className="fw-bold text-white mb-2 leading-tight" style={{ fontSize: '1.45rem' }}>
                    Modern employee tracking & leave management.
                  </h4>
                  <p className="text-white text-opacity-75 small mb-4" style={{ lineHeight: '1.6' }}>
                    Streamline attendance logging, automated leave approvals, and workforce records in a fast, responsive interface.
                  </p>
                </div>

                {/* Enterprise Metric Badges */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <div className="metric-pill">
                    <Sparkles size={13} className="text-warning" />
                    <span>Real-Time IST Sync</span>
                  </div>
                  <div className="metric-pill">
                    <ShieldCheck size={13} className="text-success" />
                    <span>Role-Based Security</span>
                  </div>
                </div>

                {/* Feature Highlights */}
                <div className="d-flex flex-column gap-3 my-2">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="p-2 rounded-3 text-white flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                    >
                      <Clock size={16} />
                    </div>
                    <div>
                      <strong className="text-white d-block small">1-Click Attendance Punching</strong>
                      <span className="text-white text-opacity-70" style={{ fontSize: '0.76rem' }}>
                        Live timestamp clock with automatic daily working hours calculation.
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="p-2 rounded-3 text-white flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                    >
                      <CalendarCheck size={16} />
                    </div>
                    <div>
                      <strong className="text-white d-block small">Dynamic Leave Quotas</strong>
                      <span className="text-white text-opacity-70" style={{ fontSize: '0.76rem' }}>
                        Auto balance deduction & attendance calendar sync on manager approval.
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="p-2 rounded-3 text-white flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                    >
                      <Users size={16} />
                    </div>
                    <div>
                      <strong className="text-white d-block small">Staff Self-Service & HR Control</strong>
                      <span className="text-white text-opacity-70" style={{ fontSize: '0.76rem' }}>
                        Intuitive portal for employees and powerful directory controls for HR.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Security Assurance */}
              <div className="pt-4 mt-4 border-top border-white border-opacity-15 position-relative" style={{ zIndex: 2 }}>
                <div className="d-flex align-items-center text-white text-opacity-80 small">
                  <CheckCircle2 size={15} className="text-success me-2" />
                  <span style={{ fontSize: '0.8rem' }}>256-Bit SSL Encrypted Enterprise Workspace</span>
                </div>
              </div>
            </div>

            {/* Right Sign-in Form Panel */}
            <div className="col-12 col-lg-7 p-4 p-md-5 bg-white d-flex flex-column justify-content-between">
              <div>
                {/* Header with Title and Quick Demo Switcher */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-2 mb-4">
                  <div>
                    <h4 className="fw-extrabold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
                      Sign In
                    </h4>
                    <p className="text-muted small m-0">Access your employee or HR administrator portal</p>
                  </div>
                  {/* Quick Role Fill Pills */}
                  <div className="bg-light p-1 rounded-pill d-inline-flex border">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1 ${activeTab === 'admin' ? 'btn-primary' : 'text-secondary border-0 bg-transparent'}`}
                      style={{ fontSize: '0.76rem' }}
                      onClick={() => handleQuickSelect('admin')}
                      title="Quick fill Admin credentials"
                    >
                      👑 Admin / HR
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1 ${activeTab === 'employee' ? 'btn-primary' : 'text-secondary border-0 bg-transparent'}`}
                      style={{ fontSize: '0.76rem' }}
                      onClick={() => handleQuickSelect('employee')}
                      title="Quick fill Employee credentials"
                    >
                      👤 Employee
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger py-2.5 px-3 small d-flex align-items-center mb-4 rounded-3 border-danger-subtle shadow-sm">
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3.5">
                    <label className="form-label small fw-bold text-secondary mb-1.5">
                      Work Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0 ps-3">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-1 py-2.5"
                        placeholder="e.g. name@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setActiveTab('');
                        }}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1.5">
                      <label className="form-label small fw-bold text-secondary m-0">
                        Password <span className="text-danger">*</span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none text-muted p-0 small"
                        style={{ fontSize: '0.785rem' }}
                        onClick={() => setShowHelpModal(true)}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0 ps-3">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-1 py-2.5"
                        placeholder="Enter your account password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setActiveTab('');
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="input-group-text bg-light text-muted border-start-0 pe-3"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me option */}
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMeCheck"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="form-check-label small text-muted user-select-none" htmlFor="rememberMeCheck">
                        Keep me signed in on this device
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 fw-bold shadow-sm"
                    disabled={loading}
                    style={{ fontSize: '0.965rem' }}
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 mt-4 border-top d-flex flex-column flex-sm-row align-items-center justify-content-between text-muted small gap-2">
                <span style={{ fontSize: '0.785rem' }}>
                  &copy; {new Date().getFullYear()} EmpTrack HRMS. All rights reserved.
                </span>
                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-muted p-0 small d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.785rem' }}
                  onClick={() => setShowHelpModal(true)}
                >
                  <HelpCircle size={14} />
                  <span>IT Helpdesk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IT Helpdesk / Password Reset Modal */}
      {showHelpModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '440px' }}>
            <div className="modal-header-custom">
              <div className="d-flex align-items-center gap-2">
                <HelpCircle size={20} className="text-primary" />
                <h6 className="m-0 fw-bold">EmpTrack IT Helpdesk</h6>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-light border-0 p-1"
                onClick={() => setShowHelpModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body-custom py-3">
              <p className="text-secondary small mb-3">
                For account password resets or login credentials assistance, please contact your organization's HR administrator:
              </p>
              <div className="p-3 bg-light rounded-3 border mb-3 small">
                <div className="mb-1">
                  <strong>HR Admin Email:</strong> <span className="text-primary font-monospace">admin@example.com</span>
                </div>
                <div>
                  <strong>Default Demo Passwords:</strong>
                  <ul className="m-0 ps-3 mt-1 text-muted">
                    <li>Admin: <code className="text-dark">admin123</code></li>
                    <li>Employee: <code className="text-dark">employee123</code></li>
                  </ul>
                </div>
              </div>
              <p className="text-muted small m-0">
                You can also click the <strong>👑 Admin / HR</strong> or <strong>👤 Employee</strong> pills at the top of the sign-in form to fill demo credentials automatically.
              </p>
            </div>
            <div className="modal-footer-custom py-2">
              <button
                type="button"
                className="btn btn-primary btn-sm px-3"
                onClick={() => setShowHelpModal(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

