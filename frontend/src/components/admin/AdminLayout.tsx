import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';

export interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  latencyMs?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  subtitle,
  children,
  actions,
  latencyMs = 38,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col">
      {/* Sidebar (Fixed 240px on lg, off-canvas on mobile) */}
      <AdminSidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by 240px / 60 Tailwind spacing) */}
      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar (64px) */}
        <AdminTopBar
          title={title}
          subtitle={subtitle}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          latencyMs={latencyMs}
        />

        {/* Content Container (max-w-[1280px], 24px padding, 16px gaps) */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto p-4 sm:p-6 flex flex-col gap-4">
          {actions && (
            <div className="flex items-center justify-between pb-2 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-2.5">{actions}</div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};

