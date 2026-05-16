const TIMEZONE_SUFFIX = /(?:z|[+-]\d{2}:?\d{2})$/i;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;

const pad = (value) => String(value).padStart(2, '0');

const hasTimezone = (value) => typeof value === 'string' && TIMEZONE_SUFFIX.test(value);

const partsFromSaoPaulo = (value) => {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
};

export const parseAppDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const dateOnly = DATE_ONLY.exec(value);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  if (typeof value === 'string' && !hasTimezone(value)) {
    const match = DATE_TIME.exec(value);
    if (match) {
      const [, year, month, day, hour, minute, second = '0'] = match;
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      );
    }
  }

  return new Date(value);
};

export const formatDateBR = (value) => {
  if (!value) return '';

  const dateOnly = typeof value === 'string' ? DATE_ONLY.exec(value) : null;
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return `${day}/${month}/${year}`;
  }

  const date = parseAppDate(value);
  return Number.isNaN(date?.getTime()) ? '' : date.toLocaleDateString('pt-BR');
};

export const formatLegacyEventDateBR = (value) => {
  if (!value) return '';

  const dateOnly = typeof value === 'string' ? DATE_ONLY.exec(value) : null;
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    // Preserves the production display for date-only event fields from the Oracle API.
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
  }

  return formatDateBR(value);
};

export const formatDateTimeBR = (value) => {
  if (!value) return '';

  if (typeof value === 'string' && !hasTimezone(value)) {
    const match = DATE_TIME.exec(value);
    if (match) {
      const [, year, month, day, hour, minute, second = '0'] = match;
      return `${day}/${month}/${year}, ${hour}:${minute}:${pad(second)}`;
    }
  }

  const parts = partsFromSaoPaulo(value);
  if (!parts.year) return '';
  return `${parts.day}/${parts.month}/${parts.year}, ${parts.hour}:${parts.minute}:${parts.second}`;
};

export const formatDateTimeLocalInput = (value) => {
  if (!value) return '';

  if (typeof value === 'string' && !hasTimezone(value)) {
    const normalized = value.replace(' ', 'T');
    return normalized.slice(0, 16);
  }

  const parts = partsFromSaoPaulo(value);
  if (!parts.year) return '';
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};
