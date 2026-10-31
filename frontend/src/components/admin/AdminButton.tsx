import React from 'react';

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subtle' | 'destructive' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string;
  iconPosition?: 'leading' | 'trailing';
}

const variantClasses = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border border-transparent focus:ring-indigo-500',
  secondary:
    'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-slate-300',
  subtle:
    'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent focus:ring-slate-300',
  outline:
    'bg-transparent hover:bg-indigo-50 text-indigo-600 border border-indigo-200 focus:ring-indigo-400',
  destructive:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent focus:ring-rose-500',
};

const sizeClasses = {
  xs: 'px-2.5 py-1 text-xs gap-1 rounded-md font-medium',
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md font-medium',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg font-medium',
  lg: 'px-5 py-2.5 text-base gap-2.5 rounded-lg font-medium',
};

export const AdminButton: React.FC<AdminButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'leading',
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-sans transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon &&
        iconPosition === 'leading' && (
          <span className="material-symbols-outlined text-[18px] shrink-0">{icon}</span>
        )
      )}

      {children && <span>{children}</span>}

      {!isLoading && icon && iconPosition === 'trailing' && (
        <span className="material-symbols-outlined text-[18px] shrink-0">{icon}</span>
      )}
    </button>
  );
};

