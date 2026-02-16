import { useCallback } from 'react';
import { notification, message } from 'antd';
import type { NotificationArgsProps } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { createElement } from 'react';
import { colors } from '../styles/theme';
import { getApiErrorMessage, getSuccessMessage, type Language } from '../utils/errorMessages';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  title?: string;
  message: string;
  description?: string;
  duration?: number;
  placement?: NotificationArgsProps['placement'];
  onClick?: () => void;
  onClose?: () => void;
  key?: string;
}

interface ToastOptions {
  duration?: number;
  key?: string;
  onClick?: () => void;
}

// Custom notification styles
const notificationStyles: Record<NotificationType, React.CSSProperties> = {
  success: {
    borderLeft: `4px solid ${colors.success}`,
    background: '#F3F1ED',
  },
  error: {
    borderLeft: `4px solid ${colors.error}`,
    background: '#EEE8DF',
  },
  info: {
    borderLeft: `4px solid ${colors.primary}`,
    background: `${colors.primaryLight}`,
  },
  warning: {
    borderLeft: `4px solid ${colors.warning}`,
    background: '#F3F1ED',
  },
};

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  success: createElement(CheckCircleOutlined, {
    style: { color: colors.success },
  }),
  error: createElement(CloseCircleOutlined, { style: { color: colors.error } }),
  info: createElement(InfoCircleOutlined, { style: { color: colors.primary } }),
  warning: createElement(WarningOutlined, { style: { color: colors.warning } }),
};

/**
 * Custom hook for notifications with Arabic-themed styling
 */
export function useNotification() {
  // Configure notification defaults
  notification.config({
    placement: 'topRight',
    duration: 4.5,
    top: 24,
  });

  /**
   * Show a notification
   */
  const showNotification = useCallback(
    (type: NotificationType, options: NotificationOptions) => {
      notification[type]({
        message: options.title || getDefaultTitle(type),
        description: options.description || options.message,
        duration: options.duration ?? 4.5,
        placement: options.placement || 'topRight',
        icon: notificationIcons[type],
        style: notificationStyles[type],
        onClick: options.onClick,
        onClose: options.onClose,
        key: options.key,
        className: 'arabic-notification',
      });
    },
    []
  );

  /**
   * Show success notification
   */
  const success = useCallback(
    (messageText: string, options?: Partial<NotificationOptions>) => {
      showNotification('success', {
        message: messageText,
        ...options,
      });
    },
    [showNotification]
  );

  /**
   * Show error notification
   */
  const error = useCallback(
    (messageText: string, options?: Partial<NotificationOptions>) => {
      showNotification('error', {
        message: messageText,
        duration: 6, // Errors stay longer
        ...options,
      });
    },
    [showNotification]
  );

  /**
   * Show info notification
   */
  const info = useCallback(
    (messageText: string, options?: Partial<NotificationOptions>) => {
      showNotification('info', {
        message: messageText,
        ...options,
      });
    },
    [showNotification]
  );

  /**
   * Show warning notification
   */
  const warning = useCallback(
    (messageText: string, options?: Partial<NotificationOptions>) => {
      showNotification('warning', {
        message: messageText,
        duration: 5,
        ...options,
      });
    },
    [showNotification]
  );

  /**
   * Show API error notification
   */
  const apiError = useCallback(
    (err: unknown, language: Language = 'en') => {
      const errorMessage = getApiErrorMessage(err, language);
      error(errorMessage, {
        title: language === 'ar' ? 'خطأ' : 'Error',
      });
    },
    [error]
  );

  /**
   * Show success message using predefined message code
   */
  const successCode = useCallback(
    (code: string, language: Language = 'en') => {
      const successMessage = getSuccessMessage(code, language);
      success(successMessage);
    },
    [success]
  );

  /**
   * Close a specific notification
   */
  const close = useCallback((key: string) => {
    notification.destroy(key);
  }, []);

  /**
   * Close all notifications
   */
  const closeAll = useCallback(() => {
    notification.destroy();
  }, []);

  return {
    success,
    error,
    info,
    warning,
    apiError,
    successCode,
    close,
    closeAll,
    showNotification,
  };
}

/**
 * Toast notifications (simpler, shorter duration)
 */
export function useToast() {
  // Configure message defaults
  message.config({
    top: 24,
    duration: 3,
    maxCount: 3,
  });

  const showToast = useCallback(
    (type: NotificationType, content: string, options?: ToastOptions) => {
      message[type]({
        content,
        duration: options?.duration ?? 3,
        key: options?.key,
        onClick: options?.onClick,
        style: {
          marginTop: '8px',
        },
      });
    },
    []
  );

  const success = useCallback(
    (content: string, options?: ToastOptions) => {
      showToast('success', content, options);
    },
    [showToast]
  );

  const error = useCallback(
    (content: string, options?: ToastOptions) => {
      showToast('error', content, { duration: 4, ...options });
    },
    [showToast]
  );

  const info = useCallback(
    (content: string, options?: ToastOptions) => {
      showToast('info', content, options);
    },
    [showToast]
  );

  const warning = useCallback(
    (content: string, options?: ToastOptions) => {
      showToast('warning', content, options);
    },
    [showToast]
  );

  const loading = useCallback(
    (content: string, key?: string) => {
      message.loading({
        content,
        key,
        duration: 0, // Doesn't auto-close
      });
    },
    []
  );

  const dismiss = useCallback((key?: string) => {
    if (key) {
      message.destroy(key);
    } else {
      message.destroy();
    }
  }, []);

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
  };
}

/**
 * Get default title based on notification type
 */
function getDefaultTitle(type: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    success: 'Success',
    error: 'Error',
    info: 'Information',
    warning: 'Warning',
  };
  return titles[type];
}

/**
 * Promise-based notification for async operations
 */
export function useAsyncNotification() {
  const { success, error } = useNotification();
  const toast = useToast();

  const withNotification = useCallback(
    async <T>(
      promise: Promise<T>,
      options: {
        loading?: string;
        success?: string;
        error?: string;
        key?: string;
      } = {}
    ): Promise<T> => {
      const key = options.key || `async-${Date.now()}`;

      if (options.loading) {
        toast.loading(options.loading, key);
      }

      try {
        const result = await promise;
        toast.dismiss(key);
        if (options.success) {
          success(options.success);
        }
        return result;
      } catch (err) {
        toast.dismiss(key);
        if (options.error) {
          error(options.error);
        } else {
          error(getApiErrorMessage(err));
        }
        throw err;
      }
    },
    [success, error, toast]
  );

  return { withNotification };
}

export default useNotification;
