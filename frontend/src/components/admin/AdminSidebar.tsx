import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const adminNavItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard', badge: undefined },
  { name: 'Subscriptions', path: '/admin/subscriptions', icon: 'autorenew', badge: '12' },
  { name: 'Invoices', path: '/admin/invoices', icon: 'receipt_long', badge: '3' },
  { name: 'Payments', path: '/admin/payments', icon: 'payments', badge: undefined },
  { name: 'Products', path: '/admin/products', icon: 'inventory_2', badge: undefined },
  { name: 'Plans', path: '/admin/plans', icon: 'tune', badge: undefined },
  { name: 'Quotation Templates', path: '/admin/quotations', icon: 'request_quote', badge: undefined },
  { name: 'Discounts', path: '/admin/discounts', icon: 'percent', badge: undefined },
  { name: 'Taxes', path: '/admin/taxes', icon: 'account_balance', badge: undefined },
  { name: 'Staff', path: '/admin/staff', icon: 'group', badge: undefined },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#0F172A] text-[#CBD5E1] flex flex-col justify-between border-r border-[#1E293B] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#1E293B]">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white tracking-tight leading-tight">
                  Brightloop
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Admin Atelier
                </span>
              </div>
            </Link>

            {/* Mobile close */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1 text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Navigation Items (Exact 10 in DESIGN.md) */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div className="px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-slate-500">
              Operations
            </div>

            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#1E293B] text-white shadow-sm font-semibold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#1E293B]/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[19px] shrink-0 opacity-80 group-hover:opacity-100">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer: Customer Portal Switcher & User Info */}
        <div className="p-3 border-t border-[#1E293B] space-y-2">
          {/* Switch to Customer Portal */}
          <Link
            to="/subscriptions"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-900/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Customer Portal</span>
            </div>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>

          {/* Admin User Card */}
          <div className="px-3 py-2 flex items-center justify-between rounded-lg bg-[#1E293B]/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                A
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">Administrator</span>
                <span className="text-[10px] text-slate-400 truncate">admin@brightloop.io</span>
              </div>
            </div>
            <Link
              to="/login"
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

