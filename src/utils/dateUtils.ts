/**
 * Utility functions for dates, renewals, and trial countdown calculations
 */

export function getDaysUntil(dateStr: string): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  // Normalize both to start of day in local time
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeRenewal(dateStr: string): {
  label: string;
  days: number;
  isUrgent: boolean;
  isToday: boolean;
  isOverdue: boolean;
} {
  const days = getDaysUntil(dateStr);
  if (days < 0) {
    return {
      label: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`,
      days,
      isUrgent: true,
      isToday: false,
      isOverdue: true,
    };
  }
  if (days === 0) {
    return {
      label: 'Renews Today',
      days,
      isUrgent: true,
      isToday: true,
      isOverdue: false,
    };
  }
  if (days === 1) {
    return {
      label: 'Tomorrow',
      days,
      isUrgent: true,
      isToday: false,
      isOverdue: false,
    };
  }
  if (days <= 3) {
    return {
      label: `In ${days} days`,
      days,
      isUrgent: true,
      isToday: false,
      isOverdue: false,
    };
  }
  if (days <= 7) {
    return {
      label: `In ${days} days`,
      days,
      isUrgent: false,
      isToday: false,
      isOverdue: false,
    };
  }
  return {
    label: formatFriendlyDate(dateStr),
    days,
    isUrgent: false,
    isToday: false,
    isOverdue: false,
  };
}

export function addDaysToCurrentDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function calculateNextBillingDate(startDate: string, cycle: string): string {
  const date = new Date(startDate || new Date());
  const now = new Date();
  
  while (date <= now) {
    if (cycle === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else if (cycle === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (cycle === 'quarterly') {
      date.setMonth(date.getMonth() + 3);
    } else if (cycle === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
  }
  
  return date.toISOString().split('T')[0];
}
