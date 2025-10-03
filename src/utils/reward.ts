import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from './date';

export const getPeriodWindow = (
  period: 'daily' | 'weekly' | 'monthly',
  baseDate: Date
): { start: Date; end: Date } => {
  if (period === 'daily') {
    return { start: startOfDay(baseDate), end: endOfDay(baseDate) };
  }
  if (period === 'weekly') {
    return { start: startOfWeek(baseDate), end: endOfWeek(baseDate) };
  }
  return { start: startOfMonth(baseDate), end: endOfMonth(baseDate) };
};

export const periodKey = (period: 'daily' | 'weekly' | 'monthly', date: Date) => {
  const window = getPeriodWindow(period, date);
  return `${period}-${window.start.toISOString().split('T')[0]}`;
};
