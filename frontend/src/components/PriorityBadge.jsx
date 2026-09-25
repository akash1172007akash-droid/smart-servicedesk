import React from 'react';
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

const PRIORITY_CONFIG = {
  CRITICAL: {
    label: 'Critical',
    classes: 'bg-rose-50 text-rose-700 border-rose-200/80 font-semibold',
    icon: AlertCircle,
    iconColor: 'text-rose-600',
  },
  HIGH: {
    label: 'High',
    classes: 'bg-orange-50 text-orange-700 border-orange-200/80',
    icon: ArrowUp,
    iconColor: 'text-orange-600',
  },
  MEDIUM: {
    label: 'Medium',
    classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  LOW: {
    label: 'Low',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: ArrowDown,
    iconColor: 'text-slate-500',
  },
};

const PriorityBadge = ({ priority, className = '', showIcon = true }) => {
  const config = PRIORITY_CONFIG[priority] || {
    label: priority || 'Unknown',
    classes: 'bg-slate-50 text-slate-600 border-slate-200',
    icon: AlertCircle,
    iconColor: 'text-slate-400',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes} ${className}`}
    >
      {showIcon && <Icon className={`w-3 h-3 ${config.iconColor}`} />}
      {config.label}
    </span>
  );
};

export default PriorityBadge;
