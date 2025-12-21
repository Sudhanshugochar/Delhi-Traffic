'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import clsx from 'clsx';

interface ErrorComponentProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  title = 'Error',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-4 p-8 rounded-lg bg-red-50 dark:bg-red-900 dark:bg-opacity-20',
        className
      )}
    >
      <div className="rounded-full bg-red-100 dark:bg-red-800 p-3">
        <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-1">{title}</h3>
        <p className="text-red-700 dark:text-red-300">{message}</p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm" className="mt-2">
          <RotateCcw size={16} className="mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  action,
  actionLabel,
  icon,
  className = '',
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-4 p-8 text-center', className)}>
      {icon && <div className="text-4xl text-gray-400 dark:text-gray-600">{icon}</div>}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>

      {action && actionLabel && (
        <Button onClick={action} variant="primary" size="sm" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
