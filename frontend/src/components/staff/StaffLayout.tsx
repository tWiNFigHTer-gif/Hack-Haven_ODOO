import React from 'react';
import { StaffTopNav } from './StaffTopNav';

export interface StaffLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({
  title,
  subtitle,
  children,
  actions,
}) => {
  return (
    <div className="min-h-screen bg-[#F6F8F7] text-[#0F172A] font-sans antialiased flex flex-col">
      {/* Top Navigation Bar with Horizontal Tabs */}
      <StaffTopNav />

      {/* Main Content Area (Max 1200px Centered) */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
        </div>

        {/* Content Body */}
        {children}
      </main>
    </div>
  );
};
