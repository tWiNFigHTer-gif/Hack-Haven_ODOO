import React, { forwardRef, useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  sublabel?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, sublabel, helperText, error, leftIcon, isPassword = false, type = 'text', className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-1.5 w-full">
        {(label || sublabel) && (
          <div className="flex justify-between items-center">
            {label && (
              <label htmlFor={inputId} className="font-medium text-sm text-on-surface block">
                {label}
              </label>
            )}
            {sublabel && (
              <span className="text-xs text-secondary">{sublabel}</span>
            )}
          </div>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            className={`w-full h-11 rounded-[6px] bg-surface-card text-on-surface text-sm transition-all shadow-sm outline-none border ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${isPassword || error ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-status-overdue-text focus:ring-1 focus:ring-status-overdue-text shadow-[0_0_0_1px_#dc2626]'
                : 'border-border-subtle focus:border-primary-container focus:ring-1 focus:ring-primary-container'
            } placeholder:text-secondary/50 ${className}`}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary hover:text-on-surface transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          ) : error ? (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-status-overdue-text">
              <span className="material-symbols-outlined text-[18px]">error</span>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="flex items-center gap-1.5 pt-0.5 text-status-overdue-text">
            <span className="material-symbols-outlined text-[15px]">report_problem</span>
            <p className="text-xs font-medium">{error}</p>
          </div>
        ) : helperText ? (
          <p className="text-xs text-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

