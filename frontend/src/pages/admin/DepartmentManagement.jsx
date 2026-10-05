import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, X } from 'lucide-react';
import { departmentService } from '../../services/departmentService';
import ConfirmModal from '../../components/ConfirmModal';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete Confirm Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDept, setTargetDept] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err.message || 'Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedDeptId(null);
    setFormData({ name: '', description: '' });
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setIsEditing(true);
    setSelectedDeptId(dept.id);
    setFormData({ name: dept.name, description: dept.description || '' });
    setModalError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      if (isEditing) {
        await departmentService.updateDepartment(selectedDeptId, formData);
      } else {
        await departmentService.createDepartment(formData);
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setModalError(err.message || 'Error saving department');
    } finally {
      setModalLoading(false);
    }
  };

  const openDeleteModal = (dept) => {
    setTargetDept(dept);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!targetDept) return;
    setDeleteLoading(true);
    try {
      await departmentService.deleteDepartment(targetDept.id);
      setDeleteModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert(err.message || 'Error deleting department');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">Department Management</h4>
          <p className="text-muted small m-0">Configure business divisions, teams, and employee assignments</p>
        </div>
        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      {error && <div className="alert alert-danger mb-3 py-2">{error}</div>}

      {/* Grid of Department Cards */}
      <div className="row g-3">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : departments.length > 0 ? (
          departments.map((dept) => (
            <div key={dept.id} className="col-12 col-md-6 col-lg-4">
              <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="p-2.5 bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center">
                      <Building2 size={24} />
                    </div>
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => openEditModal(dept)}
                        title="Edit Department"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => openDeleteModal(dept)}
                        title="Delete Department"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{dept.name}</h5>
                  <p className="text-muted small mb-3">
                    {dept.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                  <span className="small text-secondary d-flex align-items-center gap-1.5">
                    <Users size={15} />
                    <span>Assigned Staff</span>
                  </span>
                  <span className="badge bg-light text-primary border fw-bold fs-6">
                    {dept.employeeCount} {dept.employeeCount === 1 ? 'employee' : 'employees'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5 text-muted">
            No departments configured yet. Click "Add Department" to create one.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header-custom">
              <h5 className="m-0 fw-bold">{isEditing ? 'Edit Department' : 'Create Department'}</h5>
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
                {modalError && <div className="alert alert-danger py-2 small mb-3">{modalError}</div>}

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Department Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Research & Development"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Scope, objectives, or responsibilities of this department..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
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
                  {modalLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={
          targetDept?.employeeCount > 0
            ? `Cannot delete "${targetDept?.name}" because ${targetDept?.employeeCount} employee(s) are currently assigned to it. Please reassign them first.`
            : `Are you sure you want to delete the department "${targetDept?.name}"?`
        }
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default DepartmentManagement;
