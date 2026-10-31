import React from 'react';

export interface AdminStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon?: string;
  variant?: 'default' | 'overdue' | 'accent';
  isLoading?: boolean;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  subtitle,
  icon,
  variant = 'default',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse flex flex-col justify-between h-[128px]">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="w-8 h-8 rounded-lg bg-slate-100" />
        </div>
        <div>
          <div className="h-7 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  const isOverdueVariant = variant === 'overdue';

  return (
    <div
      className={`p-5 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between relative overflow-hidden ${
        isOverdueVariant
          ? 'bg-rose-50/40 border-rose-200 text-rose-900'
          : variant === 'accent'
          ? 'bg-indigo-50/40 border-indigo-200 text-slate-900'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold tracking-wider uppercase ${
            isOverdueVariant ? 'text-rose-700' : 'text-slate-500'
          }`}
        >
          {title}
        </span>
        {icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isOverdueVariant
                ? 'bg-rose-100 text-rose-700'
                : variant === 'accent'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </div>
        )}
      </div>

      {/* Metric Value & Context */}
      <div className="mt-3">
        <div
          className={`text-2xl sm:text-3xl font-bold font-sans tabular-nums tracking-tight ${
            isOverdueVariant ? 'text-rose-700' : 'text-slate-900'
          }`}
        >
          {value}
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
                isPositive === true
                  ? 'bg-emerald-50 text-emerald-700'
                  : isPositive === false
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isPositive === true && (
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
              )}
              {isPositive === false && (
                <span className="material-symbols-outlined text-[14px]">trending_down</span>
              )}
              {change}
            </span>
          )}

          {subtitle && (
            <span
              className={`text-xs ${
                isOverdueVariant ? 'text-rose-600 font-medium' : 'text-slate-500'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

