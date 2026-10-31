import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, api } from '../../lib/api';

interface NavbarProps {
  user: User | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.auth.logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background-canvas/90 backdrop-blur-xl border-b border-border-subtle shadow-[0_1px_8px_rgba(28,25,23,0.04)]">
      <div className="h-20 max-w-[1120px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-4 sm:gap-6">
          <NavLink to="/subscriptions" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary border border-border-subtle">
              <span className="material-symbols-outlined text-[22px]">eco</span>
            </div>
            <span className="font-serif text-xl sm:text-2xl font-semibold text-on-surface tracking-tight">
              Brightloop
            </span>
          </NavLink>
          <span className="hidden sm:inline-block text-xs uppercase tracking-wider text-secondary bg-surface-container px-2 py-0.5 rounded font-medium">
            Client Atelier
          </span>
        </div>

        {/* Center Navigation Links (Tabs) */}
        {user && (
          <nav className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg border border-border-subtle/40">
            <NavLink
              to="/subscriptions"
              className={({ isActive }) =>
                `px-3.5 py-1.5 text-sm transition-all rounded-lg ${
                  isActive
                    ? 'bg-primary-container text-surface-card font-medium shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`
              }
            >
              Subscriptions
            </NavLink>
            <NavLink
              to="/invoices"
              className={({ isActive }) =>
                `px-3.5 py-1.5 text-sm transition-all rounded-lg ${
                  isActive
                    ? 'bg-primary-container text-surface-card font-medium shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`
              }
            >
              Invoices
            </NavLink>
          </nav>
        )}

        {/* Right Section: Concierge & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary hover:text-on-surface hover:bg-surface-container-low rounded transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            <span>Concierge</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-surface-container-low border border-border-subtle/50">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-medium text-on-surface leading-tight">
                    {user.firstName} {user.lastName[0]}.
                  </span>
                  <span className="text-[10px] text-secondary leading-tight">{user.tier}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-secondary hover:text-primary rounded-md transition-colors"
                title="Log out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="text-xs font-medium text-primary hover:text-accent-hover transition-colors"
            >
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

