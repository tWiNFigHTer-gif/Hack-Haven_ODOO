import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

interface StaffTopNavProps {
  onSearch?: (query: string) => void;
}

const NAV_TABS = [
  { name: 'Today', path: '/staff/today', icon: 'wb_sunny' },
  { name: 'Quotations', path: '/staff/quotations', icon: 'request_quote' },
  { name: 'Subscriptions', path: '/staff/subscriptions', icon: 'autorenew' },
  { name: 'Invoices', path: '/staff/invoices', icon: 'receipt_long' },
  { name: 'Payments', path: '/staff/payments', icon: 'payments' },
];

export const StaffTopNav: React.FC<StaffTopNavProps> = ({ onSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Main top bar: 64px height */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/staff/today" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white shadow-xs group-hover:bg-[#115E59] transition-colors">
                <span className="material-symbols-outlined text-[20px]">all_inclusive</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-base tracking-tight leading-none">
                  Brightloop
                </span>
                <span className="text-[10px] font-semibold text-[#0F766E] uppercase tracking-wider mt-0.5">
                  Staff Portal
                </span>
              </div>
            </Link>

            {/* Operational Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
              <span className="text-[11px] font-medium">Operational</span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Horizontal Top Tabs) */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_TABS.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#F0FDFA] text-[#0F766E] font-semibold border border-[#CCFBF1] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right: Search, Notification, Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Search Box */}
            <div className="relative hidden sm:block w-48 md:w-60">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Search staff tasks..."
                onChange={(e) => onSearch && onSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
              />
            </div>

            {/* Profile Avatar / Quick Info */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20 flex items-center justify-center font-bold text-xs">
                ST
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">Staff Member</span>
                <span className="text-[10px] text-slate-400 leading-tight">team@brightloop.io</span>
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
              aria-label="Toggle navigation"
            >
              <span className="material-symbols-outlined text-[22px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (below lg breakpoint) */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 flex flex-col gap-1 animate-fadeIn">
            {NAV_TABS.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-[#F0FDFA] text-[#0F766E] font-semibold border border-[#CCFBF1]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
