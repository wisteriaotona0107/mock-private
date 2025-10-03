const formatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

export const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const startOfWeek = (date: Date) => {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
};

export const endOfWeek = (date: Date) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const startOfMonth = (date: Date) => {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
};

export const endOfMonth = (date: Date) => {
  const d = startOfMonth(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const isWithinRange = (date: Date, start: Date, end: Date) => {
  return date >= start && date <= end;
};

export const formatDate = (value?: string) => {
  if (!value) return '-';
  return formatter.format(new Date(value));
};

export const formatRange = (start: string, end: string) => {
  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
};
