import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-background-canvas border-t border-border-subtle/40 mt-auto">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-secondary text-xs">
        <div className="flex items-center gap-3">
          <span className="font-serif text-sm font-semibold text-on-surface">Brightloop</span>
          <span>© 2025 Brightloop Sanctuary. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#concierge" className="hover:text-on-surface transition-colors">
            Concierge Desk
          </a>
          <a href="#privacy" className="hover:text-on-surface transition-colors">
            Terms & Discretion
          </a>
          <a href="#security" className="hover:text-on-surface transition-colors">
            Security Guarantee
          </a>
        </div>
      </div>
    </footer>
  );
};

