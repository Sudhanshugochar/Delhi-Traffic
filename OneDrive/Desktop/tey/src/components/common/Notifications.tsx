'use client';

import React, { useEffect } from 'react';
import { useNotificationStore } from '@/context/store';
import clsx from 'clsx';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationProps {
  notification: {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  };
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(onClose, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20',
      border: 'border-green-200 dark:border-green-800',
      icon: <CheckCircle2 className="text-green-600 dark:text-green-400" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20',
      border: 'border-red-200 dark:border-red-800',
      icon: <AlertCircle className="text-red-600 dark:text-red-400" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Info className="text-blue-600 dark:text-blue-400" />,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: <AlertTriangle className="text-yellow-600 dark:text-yellow-400" />,
    },
  };

  const config = typeConfig[notification.type];

  return (
    <div
      className={clsx(
        'flex items-center gap-3 p-4 rounded-lg border animate-slide-in-up',
        config.bg,
        config.border
      )}
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
        {notification.message}
      </p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};
