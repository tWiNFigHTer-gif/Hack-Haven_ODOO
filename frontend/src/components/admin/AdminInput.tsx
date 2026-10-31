import React from 'react';

export interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  prefix?: string;
}

export const AdminInput: React.FC<AdminInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  prefix,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {leftIcon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
            {leftIcon}
          </span>
        )}

        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm pointer-events-none">
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          className={`w-full rounded-lg border py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 ${
            leftIcon ? 'pl-9' : prefix ? 'pl-7' : 'pl-3'
          } ${rightIcon ? 'pr-9' : 'pr-3'} ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:ring-indigo-100 bg-white'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface AdminToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const AdminToggle: React.FC<AdminToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">{label}</span>
        {description && <span className="text-xs text-slate-500">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 ${
          checked ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export interface AdminSegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (val: T) => void;
  label?: string;
}

export function AdminSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: AdminSegmentedControlProps<T>) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              value === opt.value
                ? 'bg-white text-indigo-600 font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

