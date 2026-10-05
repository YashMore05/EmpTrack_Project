import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  Download,
  X,
  Building,
  RefreshCw
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const initialFormState = {
    employeeCode: '',
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    departmentId: '',
    designation: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    address: '',
    salary: '',
    status: 'ACTIVE',
    password: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Deactivate & Delete Confirm Modals
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedDept) params.departmentId = selectedDept;
      if (selectedStatus) params.status = selectedStatus;

      const data = await employeeService.getAllEmployees(params);
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const depts = await departmentService.getAllDepartments();
      setDepartments(depts);
      if (depts.length > 0 && !formData.departmentId) {
        setFormData((prev) => ({ ...prev, departmentId: depts[0].id }));
      }
    } catch (err) {
      console.error('Error fetching departments', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept, selectedStatus]);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentEmployeeId(null);
    setFormData({
      ...initialFormState,
      departmentId: departments.length > 0 ? departments[0].id : '',
      employeeCode: `EMP00${employees.length + 1}`,
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (emp) => {
    setIsEditing(true);
    setCurrentEmployeeId(emp.id);
    setFormData({
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone || '',
      gender: emp.gender || 'Male',
      dateOfBirth: emp.dateOfBirth || '',
      departmentId: emp.departmentId || (departments.length > 0 ? departments[0].id : ''),
      designation: emp.designation,
      joiningDate: emp.joiningDate || '',
      address: emp.address || '',
      salary: emp.salary || '',
      status: emp.status || 'ACTIVE',
      password: '', // Blank unless updating password
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setModalLoading(true);

    try {
      const payload = {
        ...formData,
        departmentId: Number(formData.departmentId),
        salary: formData.salary ? Number(formData.salary) : null,
      };

      if (isEditing) {
        await employeeService.updateEmployee(currentEmployeeId, payload);
      } else {
        await employeeService.createEmployee(payload);
      }

      setModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.message || 'Error saving employee.');
    } finally {
      setModalLoading(false);
    }
  };

  const openDeactivateModal = (emp) => {
    setTargetEmployee(emp);
    setDeactivateModalOpen(true);
  };

  const handleDeactivate = async () => {
    if (!targetEmployee) return;
    setActionLoading(true);
    try {
      await employeeService.deactivateEmployee(targetEmployee.id);
      setDeactivateModalOpen(false);
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Failed to deactivate employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (emp) => {
    try {
      await employeeService.activateEmployee(emp.id);
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Failed to reactivate employee');
    }
  };

  const openDeleteModal = (emp) => {
    setTargetEmployee(emp);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!targetEmployee) return;
    setActionLoading(true);
    try {
      await employeeService.deleteEmployee(targetEmployee.id);
      setDeleteModalOpen(false);
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Failed to permanently delete employee');
    } finally {
      setActionLoading(false);
    }
  };

  const exportToCSV = () => {
    if (employees.length === 0) return;
    const headers = ['Employee ID', 'Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Joining Date', 'Status'];
    const rows = employees.map((emp) => [
      `"${emp.employeeCode || ''}"`,
      `"${emp.fullName || ''}"`,
      `"${emp.email || ''}"`,
      `"${emp.phone || ''}"`,
      `"${emp.departmentName || 'General'}"`,
      `"${emp.designation || ''}"`,
      `"${emp.joiningDate || ''}"`,
      `"${emp.status || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `EmpTrack_Staff_Directory_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold text-dark m-0">Employee Directory</h4>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.72rem' }}>
              {employees.length} Records
            </span>
          </div>
          <p className="text-muted small m-0 mt-0.5">Manage staff records, employment profiles, and account statuses</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5"
            onClick={exportToCSV}
            disabled={employees.length === 0}
            title="Export staff directory to CSV (Excel compatible)"
          >
            <Download size={16} />
            <span className="d-none d-sm-inline">Export CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm"
            onClick={openAddModal}
          >
            <UserPlus size={18} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3 py-2">{error}</div>}

      {/* Filters Bar */}
      <div className="custom-card p-3 mb-4">
        <div className="row g-2.5 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-5 col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1"
                placeholder="Search by name, ID code, designation, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="col-12 col-sm-6 col-md-3 col-lg-3">
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-12 col-sm-6 col-md-2 col-lg-2">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="col-12 col-md-2 col-lg-2">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearch('');
                setSelectedDept('');
                setSelectedStatus('');
              }}
              title="Reset Filters"
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="custom-card">
        <div className="table-responsive">
          <table className="table custom-table mb-0">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th className="text-center">Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    <span className="text-muted small">Loading employees...</span>
                  </td>
                </tr>
              ) : employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        <div className="avatar bg-primary-subtle text-primary fw-bold">
                          {emp.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">{emp.fullName}</div>
                          <div className="text-muted small">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace">
                        {emp.employeeCode}
                      </span>
                    </td>
                    <td className="text-secondary fw-medium">{emp.departmentName || 'General'}</td>
                    <td className="text-secondary">{emp.designation}</td>
                    <td className="small text-secondary">{emp.joiningDate}</td>
                    <td className="text-center">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/admin/employees/${emp.id}`}
                          className="btn btn-outline-secondary"
                          title="View Profile Details"
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => openEditModal(emp)}
                          title="Edit Employee"
                        >
                          <Edit2 size={15} />
                        </button>
                        {emp.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            className="btn btn-outline-warning text-dark"
                            onClick={() => openDeactivateModal(emp)}
                            title="Deactivate Account (Soft Offboard)"
                          >
                            <UserX size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={() => handleActivate(emp)}
                            title="Reactivate Account"
                          >
                            <UserCheck size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => openDeleteModal(emp)}
                          title="Delete Employee Permanently"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No employees found matching the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '680px' }}>
            <div className="modal-header-custom">
              <h5 className="m-0 fw-bold">{isEditing ? 'Edit Employee Details' : 'Add New Employee'}</h5>
              <button
                type="button"
                className="btn btn-sm btn-light border-0 p-1"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body-custom">
                {formError && <div className="alert alert-danger py-2 small mb-3">{formError}</div>}

                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Employee ID / Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. EMP009"
                      value={formData.employeeCode}
                      onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Deshmukh"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="rahul.deshmukh@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1-555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-sm-4">
                    <label className="form-label small fw-semibold">Gender</label>
                    <select
                      className="form-select"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-12 col-sm-4">
                    <label className="form-label small fw-semibold">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-sm-4">
                    <label className="form-label small fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Department *</label>
                    <select
                      className="form-select"
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      required
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Designation *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Product Designer"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Joining Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Annual CTC / Salary (₹ INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="e.g. 1200000.00"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Residential Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Flat/House No., Society, Area, City (e.g. Bengaluru, Pune, Mumbai), PIN"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">
                      {isEditing ? 'New Password (leave blank to keep current)' : 'Account Password *'}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder={isEditing ? '••••••••' : 'Minimum 6 characters (default: employee123)'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setModalOpen(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirm Modal */}
      <ConfirmModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Employee Account"
        message={`Are you sure you want to deactivate ${targetEmployee?.fullName} (${targetEmployee?.employeeCode})? Their login account will be disabled immediately, but historical attendance and leave logs will remain intact for audit.`}
        confirmText="Deactivate Account"
        confirmVariant="warning"
        loading={actionLoading}
      />

      {/* Permanent Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Permanently Delete Employee"
        message={`Are you sure you want to permanently delete ${targetEmployee?.fullName} (${targetEmployee?.employeeCode})? This action cannot be undone and will delete their profile, login credentials, attendance logs, and leave requests from the database.`}
        confirmText="Delete Permanently"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default EmployeeList;
