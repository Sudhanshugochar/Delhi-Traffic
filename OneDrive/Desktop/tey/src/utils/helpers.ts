import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';

export const formatDate = (date: string | Date) => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM dd, yyyy');
  } catch {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date: string | Date) => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM dd, yyyy HH:mm:ss');
  } catch {
    return 'Invalid Date';
  }
};

export const formatTimeAgo = (date: string | Date) => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(d);
  } catch {
    return 'Unknown';
  }
};

export const getCertificateStatus = (expiryDate: string): 'active' | 'expiring soon' | 'expired' => {
  try {
    const expiry = parseISO(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);

    if (isBefore(expiry, now)) return 'expired';
    if (isBefore(expiry, thirtyDaysFromNow)) return 'expiring soon';
    return 'active';
  } catch {
    return 'active';
  }
};

export const getDaysUntilExpiry = (expiryDate: string): number => {
  try {
    const expiry = parseISO(expiryDate);
    const now = new Date();
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  } catch {
    return 0;
  }
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (func as any)(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
