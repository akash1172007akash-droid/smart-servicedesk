import React from 'react';

const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    classes: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-500',
  },
  ASSIGNED: {
    label: 'Assigned',
    classes: 'bg-purple-50 text-purple-700 border-purple-200/80',
    dot: 'bg-purple-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500 animate-pulse',
  },
  RESOLVED: {
    label: 'Resolved',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  CLOSED: {
    label: 'Closed',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
};

const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    classes: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
