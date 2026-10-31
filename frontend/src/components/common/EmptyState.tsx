import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'spa',
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-surface-card rounded-[14px] border border-border-subtle shadow-sm text-center max-w-xl mx-auto my-6">
      <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4 text-secondary">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface mb-2">
        {title}
      </h3>
      <p className="text-sm text-secondary mb-6 max-w-md leading-relaxed">
        {description}
      </p>
      {(primaryActionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          {primaryActionLabel && onPrimaryAction && (
            <Button variant="primary" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

