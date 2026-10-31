import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-[580px]',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-on-surface/35 backdrop-blur-[4px] flex items-center justify-center p-3 sm:p-6 transition-all">
      <div
        className={`w-full ${maxWidth} bg-surface-card rounded-[14px] shadow-[0_12px_36px_-4px_rgba(28,25,23,0.12)] p-6 sm:p-8 relative z-50 my-auto animate-in fade-in zoom-in-95 duration-200 border border-border-subtle`}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
            <div>
              {title && (
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface">
                  {title}
                </h2>
              )}
              {subtitle && (
                <div className="text-sm text-secondary mt-1">{subtitle}</div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

