import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const s = status.toUpperCase();

  let badgeClass = 'badge-cancelled';
  let label = status;

  switch (s) {
    case 'ACTIVE':
    case 'PRESENT':
    case 'APPROVED':
      badgeClass = 'badge-present';
      label = s.charAt(0) + s.slice(1).toLowerCase();
      break;
    case 'INACTIVE':
    case 'ABSENT':
    case 'REJECTED':
      badgeClass = 'badge-absent';
      label = s.charAt(0) + s.slice(1).toLowerCase();
      break;
    case 'PENDING':
      badgeClass = 'badge-pending';
      label = 'Pending';
      break;
    case 'HALF_DAY':
      badgeClass = 'badge-half-day';
      label = 'Half Day';
      break;
    case 'ON_LEAVE':
      badgeClass = 'badge-on-leave';
      label = 'On Leave';
      break;
    case 'CANCELLED':
      badgeClass = 'badge-cancelled';
      label = 'Cancelled';
      break;
    case 'CASUAL_LEAVE':
      badgeClass = 'badge-status bg-info-subtle text-info-emphasis';
      label = 'Casual Leave';
      return <span className={badgeClass}>{label}</span>;
    case 'SICK_LEAVE':
      badgeClass = 'badge-status bg-warning-subtle text-warning-emphasis';
      label = 'Sick Leave';
      return <span className={badgeClass}>{label}</span>;
    case 'PAID_LEAVE':
      badgeClass = 'badge-status bg-primary-subtle text-primary-emphasis';
      label = 'Paid Leave';
      return <span className={badgeClass}>{label}</span>;
    case 'UNPAID_LEAVE':
      badgeClass = 'badge-status bg-secondary-subtle text-secondary-emphasis';
      label = 'Unpaid Leave';
      return <span className={badgeClass}>{label}</span>;
    default:
      label = status;
  }

  return <span className={`badge-status ${badgeClass}`}>{label}</span>;
};

export default StatusBadge;
