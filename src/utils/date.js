/** Date helpers. All dates are exchanged as ISO-8601 strings. */

/** Returns the current timestamp as an ISO-8601 string. */
export function nowIso() {
  return new Date().toISOString();
}

/** Returns the ISO-8601 string for a number of days in the past. */
export function isoDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/** Returns the ISO-8601 string for a number of days in the future. */
export function isoDaysAhead(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/** Formats an ISO date as `12 Mar 2026`. */
export function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** Formats an ISO date as `12 Mar 2026, 14:30`. */
export function formatDateTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Formats an ISO date as `12 Mar`. */
export function formatShortDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(date);
}

/** Formats a date as a long weekday label, e.g. `Thursday, 22 October`. */
export function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/**
 * Formats an ISO date as a relative description such as `2 hours ago`.
 */
export function formatRelativeTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absolute = Math.abs(deltaSeconds);

  const units = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, secondsInUnit] of units) {
    if (absolute >= secondsInUnit) {
      return formatter.format(Math.round(deltaSeconds / secondsInUnit), unit);
    }
  }
  return 'just now';
}

/** Formats a number of seconds as `mm:ss`. */
export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Returns a value suitable for an `<input type="date">`. */
export function toDateInputValue(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

/**
 * Formats an ISO date in a specific IANA time zone, for example
 * `12 Mar 2026, 14:30`. Falls back to the local format when the zone is not
 * recognised by the runtime.
 */
export function formatDateInTimeZone(iso, timeZone) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  if (!timeZone) return formatDateTime(iso);
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(date);
  } catch {
    return formatDateTime(iso);
  }
}
