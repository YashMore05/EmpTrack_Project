import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  MapPin,
  Shield,
  PieChart
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { leaveBalanceService } from '../../services/leaveBalanceService';
import StatusBadge from '../../components/StatusBadge';

const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.employeeId) return;
      setLoading(true);
      setError('');
      try {
        const [emp, bal] = await Promise.all([
          employeeService.getEmployeeById(user.employeeId),
          leaveBalanceService.getLeaveBalance(user.employeeId),
        ]);
        setProfile(emp);
        setBalance(bal);
      } catch (err) {
        setError(err.message || 'Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error || !profile) {
    return <div className="alert alert-danger">{error || 'Unable to find employee record.'}</div>;
  }

  const initials = profile.fullName
    ? profile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div>
      {/* Page Title */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark m-0">My Employee Profile</h4>
        <p className="text-muted small m-0">View your official company records, employment details, and leave quotas</p>
      </div>

      {/* Main Profile Card */}
      <div className="custom-card p-4 mb-4">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-4">
          <div className="avatar avatar-lg bg-primary text-white fw-bold shadow-sm" style={{ width: '80px', height: '80px', fontSize: '1.75rem' }}>
            {initials}
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h4 className="fw-bold text-dark m-0">{profile.fullName}</h4>
              <StatusBadge status={profile.status} />
            </div>
            <div className="text-muted mt-1">
              <span className="fw-semibold text-primary">{profile.designation}</span> &bull; {profile.departmentName}
            </div>
            <div className="mt-2 d-flex flex-wrap gap-2">
              <span className="badge bg-light text-secondary border font-monospace">
                ID: {profile.employeeCode}
              </span>
              <span className="badge bg-light text-secondary border">
                Role: {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Personal & Employment Details */}
        <div className="col-12 col-lg-8">
          <div className="custom-card p-4 h-100">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Employment Information</h6>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Mail size={16} />
                  <span>Work Email</span>
                </div>
                <div className="fw-semibold text-dark">{profile.email}</div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Phone size={16} />
                  <span>Contact Phone</span>
                </div>
                <div className="fw-semibold text-dark">{profile.phone || 'Not recorded'}</div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Building size={16} />
                  <span>Assigned Department</span>
                </div>
                <div className="fw-semibold text-dark">{profile.departmentName}</div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Briefcase size={16} />
                  <span>Job Designation</span>
                </div>
                <div className="fw-semibold text-dark">{profile.designation}</div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Calendar size={16} />
                  <span>Joining Date</span>
                </div>
                <div className="fw-semibold text-dark">{profile.joiningDate}</div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <User size={16} />
                  <span>Gender / Date of Birth</span>
                </div>
                <div className="fw-semibold text-dark">
                  {profile.gender || 'Not specified'} {profile.dateOfBirth ? `(${profile.dateOfBirth})` : ''}
                </div>
              </div>

              <div className="col-12">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <MapPin size={16} />
                  <span>Residential Address</span>
                </div>
                <div className="fw-semibold text-dark">{profile.address || 'No residential address provided.'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Quota Card */}
        <div className="col-12 col-lg-4">
          <div className="custom-card p-4 h-100">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center gap-2">
              <PieChart size={18} className="text-primary" />
              <span>My Leave Quotas</span>
            </h6>

            <div className="d-flex flex-column gap-3 mt-3">
              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark">Casual Leave</div>
                  <div className="text-muted small">8 days/year</div>
                </div>
                <span className="badge bg-info text-dark fs-6 px-3 py-1.5">
                  {balance?.casualLeave ?? 0} days
                </span>
              </div>

              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark">Sick Leave</div>
                  <div className="text-muted small">6 days/year</div>
                </div>
                <span className="badge bg-warning text-dark fs-6 px-3 py-1.5">
                  {balance?.sickLeave ?? 0} days
                </span>
              </div>

              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark">Paid Leave</div>
                  <div className="text-muted small">12 days/year</div>
                </div>
                <span className="badge bg-primary fs-6 px-3 py-1.5">
                  {balance?.paidLeave ?? 0} days
                </span>
              </div>

              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark">Unpaid Leave</div>
                  <div className="text-muted small">Uncapped</div>
                </div>
                <span className="badge bg-secondary fs-6 px-3 py-1.5">
                  {balance?.unpaidLeave ?? 0} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
