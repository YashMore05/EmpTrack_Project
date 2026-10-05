import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger', loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '440px' }}>
        <div className="modal-header-custom">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={20} className={confirmVariant === 'danger' ? 'text-danger' : confirmVariant === 'warning' ? 'text-warning' : 'text-primary'} />
            <h6 className="m-0 fw-bold">{title}</h6>
          </div>
          <button type="button" className="btn btn-sm btn-light border-0 p-1" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body-custom py-3">
          <p className="text-muted m-0">{message}</p>
        </div>
        <div className="modal-footer-custom py-2">
          <button type="button" className="btn btn-light border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
