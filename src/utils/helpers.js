import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (dateStr) => {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Hoje';
  if (isTomorrow(date)) return 'Amanhã';
  return format(date, "dd 'de' MMMM", { locale: ptBR });
};

export const formatDateFull = (dateStr) => {
  return format(parseISO(dateStr), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

export const formatDateShort = (dateStr) => {
  return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR });
};

export const formatTimeAgo = (dateStr) => {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ptBR });
};

export const formatWeekday = (dateStr) => {
  return format(parseISO(dateStr), 'EEE', { locale: ptBR });
};

export const formatDayMonth = (dateStr) => {
  return format(parseISO(dateStr), 'dd/MM', { locale: ptBR });
};

export const getDayOfWeekLabel = (dateStr) => {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Hoje';
  if (isTomorrow(date)) return 'Amanhã';
  return format(date, 'EEEE', { locale: ptBR });
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
