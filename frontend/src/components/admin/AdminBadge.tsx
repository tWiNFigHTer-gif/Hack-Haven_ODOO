import React from 'react';

export type AdminBadgeStatus =
  | 'draft'
  | 'quotation'
  | 'confirmed'
  | 'active'
  | 'paid'
  | 'paused'
  | 'pending'
  | 'overdue'
  | 'closed'
  | 'cancelled';

export interface AdminBadgeProps {
  status: AdminBadgeStatus | string;
  label?: string;
  withDot?: boolean;
  pulseDot?: boolean;
  size?: 'sm' | 'md';
}

const statusStyles: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  draft: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  quotation: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  confirmed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  active: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  paid: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  paused: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  overdue: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  closed: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  cancelled: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  status,
  label,
  withDot = true,
  pulseDot = false,
  size = 'sm',
}) => {
  const normalizedKey = status.toLowerCase();
  const style = statusStyles[normalizedKey] || statusStyles.draft;
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      {withDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${style.dot} ${pulseDot ? 'animate-pulse' : ''}`}
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};

