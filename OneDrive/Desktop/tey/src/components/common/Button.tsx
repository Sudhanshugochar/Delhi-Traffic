'use client';

import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className = '', children }) => {
  const variantClasses = {
    default: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <span className={clsx('inline-block px-3 py-1 rounded-full text-sm font-medium', variantClasses[variant], className)}>
      {children}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'active' | 'expired' | 'expiring soon';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const variants = {
    active: 'success' as const,
    'expiring soon': 'warning' as const,
    expired: 'danger' as const,
  };

  return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};

interface TrustLevelBadgeProps {
  level: 'High' | 'Medium' | 'Low';
}

export const TrustLevelBadge: React.FC<TrustLevelBadgeProps> = ({ level }) => {
  const variants = {
    High: 'success' as const,
    Medium: 'warning' as const,
    Low: 'danger' as const,
  };

  return <Badge variant={variants[level]}>{level}</Badge>;
};
