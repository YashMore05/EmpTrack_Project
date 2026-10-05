import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }) => {
  const colorMap = {
    primary: { bg: '#eef2ff', text: '#4f46e5', accent: '#4f46e5' },
    success: { bg: '#ecfdf5', text: '#059669', accent: '#10b981' },
    warning: { bg: '#fffbeb', text: '#d97706', accent: '#f59e0b' },
    danger: { bg: '#fef2f2', text: '#dc2626', accent: '#ef4444' },
    info: { bg: '#f0fdfa', text: '#0d9488', accent: '#14b8a6' },
    purple: { bg: '#faf5ff', text: '#9333ea', accent: '#a855f7' },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div
      className="custom-card stat-card h-100"
      style={{ color: scheme.accent }}
    >
      {/* Top Header: Title on Left, Icon on Right */}
      <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
        <span className="stat-label m-0" title={title}>
          {title}
        </span>
        {Icon && (
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: scheme.bg, color: scheme.text }}
          >
            <Icon size={19} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="stat-value text-dark mb-2">
        {value !== undefined && value !== null ? value : 0}
      </div>

      {/* Subtitle & Trend */}
      <div
        className="text-muted small d-flex flex-wrap align-items-center gap-1.5"
        style={{ fontSize: '0.76rem', minHeight: '1.25rem', lineHeight: '1.3' }}
      >
        {trend && (
          <span
            className="badge bg-light text-secondary border font-monospace py-0.5 px-1.5"
            style={{ fontSize: '0.68rem' }}
          >
            {trend}
          </span>
        )}
        <span className="text-secondary">{subtitle || ''}</span>
      </div>
    </div>
  );
};

export default StatCard;
