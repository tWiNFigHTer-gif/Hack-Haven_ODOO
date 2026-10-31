import React from 'react';
import { StatusType } from '../../styles/tokens';

export interface BadgeProps {
  status: StatusType | string;
  label?: string;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  label,
  pulse = false,
  className = '',
}) => {
  const normStatus = status.toLowerCase() as StatusType;

  const styleMap: Record<string, { bg: string; text: string; dot?: string }> = {
    active: { bg: 'bg-status-active-bg', text: 'text-status-active-text', dot: 'bg-status-active-text' },
    paid: { bg: 'bg-status-active-bg', text: 'text-status-active-text', dot: 'bg-status-active-text' },
    outstanding: { bg: 'bg-status-outstanding-bg', text: 'text-status-outstanding-text', dot: 'bg-status-outstanding-text' },
    paused: { bg: 'bg-status-paused-bg', text: 'text-status-paused-text', dot: 'bg-status-paused-text' },
    overdue: { bg: 'bg-status-overdue-bg', text: 'text-status-overdue-text', dot: 'bg-status-overdue-text' },
    failed: { bg: 'bg-status-overdue-bg', text: 'text-status-overdue-text', dot: 'bg-status-overdue-text' },
    confirmed: { bg: 'bg-status-confirmed-bg', text: 'text-status-confirmed-text', dot: 'bg-status-confirmed-text' },
    quotation: { bg: 'bg-status-quotation-bg', text: 'text-status-quotation-text', dot: 'bg-status-quotation-text' },
    draft: { bg: 'bg-status-draft-bg', text: 'text-status-draft-text', dot: 'bg-status-draft-text' },
    closed: { bg: 'bg-status-closed-bg', text: 'text-status-closed-text', dot: 'bg-status-closed-text' },
  };

  const current = styleMap[normStatus] || {
    bg: 'bg-surface-container',
    text: 'text-secondary',
    dot: 'bg-secondary',
  };

  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-medium tracking-wide ${current.bg} ${current.text} ${className}`}
    >
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};

