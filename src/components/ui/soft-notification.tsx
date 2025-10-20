"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface SoftNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const notificationStyles = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClassName: 'text-green-600'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClassName: 'text-red-600'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClassName: 'text-blue-600'
  }
};

export function SoftNotification({ 
  message, 
  type = 'info', 
  duration = 3000,
  onClose 
}: SoftNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Плавное появление
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Автоматическое скрытие
    const hideTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        onClose?.();
      }, 300); // Время для анимации выхода
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const style = notificationStyles[type];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
        'transform translate-y-0 opacity-100',
        isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        isLeaving && 'translate-y-2 opacity-0',
        style.className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', style.iconClassName)} />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Хук для управления уведомлениями
export function useSoftNotification() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
  }>>([]);

  const showNotification = (
    message: string, 
    type: 'success' | 'error' | 'info' = 'info', 
    duration?: number
  ) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const NotificationContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <SoftNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );

  return {
    showNotification,
    NotificationContainer
  };
}
