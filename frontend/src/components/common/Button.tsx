import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-[10px] cursor-pointer';

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-primary-container hover:bg-accent-hover text-surface-card shadow-[0_2px_8px_rgba(154,91,60,0.25)]',
    secondary:
      'bg-surface-card hover:bg-surface-container-low text-on-surface border border-border-subtle shadow-sm',
    ghost:
      'bg-transparent hover:bg-surface-container-low text-primary hover:text-accent-hover',
    danger:
      'bg-status-overdue-text hover:bg-red-700 text-white shadow-sm',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">
          progress_activity
        </span>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

