import React, { useEffect } from 'react';
import { AdminButton } from './AdminButton';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isDestructive = false,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10 transform transition-all duration-200 scale-100">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDestructive ? 'warning' : 'help_outline'}
            </span>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <AdminButton variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </AdminButton>
          <AdminButton
            variant={isDestructive ? 'destructive' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
};

