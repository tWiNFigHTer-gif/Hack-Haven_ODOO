import React from 'react';

export interface AdminTopBarProps {
  title: string;
  subtitle?: string;
  onOpenMobileSidebar?: () => void;
  latencyMs?: number;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  title,
  subtitle,
  onOpenMobileSidebar,
  latencyMs = 42,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block leading-tight">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Global Search & Latency Metric */}
      <div className="flex items-center gap-3">
        {/* Global Search Input */}
        <div className="relative hidden md:block w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search records, subscriptions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white transition-all"
          />
        </div>

        {/* Latency Label (DESIGN.md requirement: Show a small "Loaded in X ms" label in the corner) */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Loaded in {latencyMs} ms</span>
        </div>

        {/* Quick Help / Docs */}
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Documentation"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};

