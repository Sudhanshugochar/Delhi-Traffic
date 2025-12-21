'use client';

import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const TableSkeleton: React.FC<SkeletonProps> = ({ className = '', count = 5 }) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-12 flex-shrink-0 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<SkeletonProps> = ({ className = '', count = 4 }) => {
  return (
    <div className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
};

export const ListSkeleton: React.FC<SkeletonProps> = ({ className = '', count = 5 }) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      ))}
    </div>
  );
};
