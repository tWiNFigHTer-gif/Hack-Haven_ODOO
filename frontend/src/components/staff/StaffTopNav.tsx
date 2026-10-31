import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

interface StaffTopNavProps {
  onSearch?: (query: string) => void;
}

const NAV_TABS = [
  { name: 'Today', path: '/staff/today' },
  { name: 'Quotations', path: '/staff/quotations' },
  { name: 'Subscriptions', path: '/staff/subscriptions' },
  { name: 'Invoices', path: '/staff/invoices' },
  { name: 'Payments', path: '/staff/payments' },
];

export const StaffTopNav: React.FC<StaffTopNavProps> = ({ onSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Main top bar: 64px height */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + STAFF badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/staff/today" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white shadow-xs group-hover:bg-[#115E59] transition-colors">
                <span className="material-symbols-outlined text-[20px]">all_inclusive</span>
              </div>
              <span className="font-bold text-slate-900 text-base tracking-tight">
                Brightloop
              </span>
            </Link>

            {/* STAFF badge — dark solid pill matching Stitch */}
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold text-white bg-slate-800 tracking-wide">
              STAFF
            </span>
          </div>

          {/* Desktop Navigation Tabs — text only, active underline style matching Stitch */}
          <nav className="hidden lg:flex items-center h-full">
            {NAV_TABS.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `relative h-16 px-4 flex items-center text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#0F766E] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0F766E] after:rounded-t'
                      : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>

          {/* Right: Search, Bell, Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Box */}
            <div className="relative hidden sm:block w-48 md:w-52">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Search customer, invoice..."
                onChange={(e) => onSearch && onSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
              />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>

            {/* Profile: avatar + name — matching Stitch "Sarah Jenkins / Staff Workspace" */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <img
                src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=0F766E&color=fff&size=64&font-size=0.4"
                alt="Sarah Jenkins"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">Sarah Jenkins</span>
                <span className="text-[10px] text-slate-500 leading-tight">Staff Workspace</span>
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

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 flex flex-col gap-1">
            {NAV_TABS.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-[#F0FDFA] text-[#0F766E] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
