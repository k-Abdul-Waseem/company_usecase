/** Formatting helpers shared across the application. */

/** Formats a 0-100 ratio as a percentage string. */
export function formatPercent(value, fractionDigits = 0) {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(fractionDigits)}%`;
}

/** Formats a ratio between 0 and 1 as a percentage string. */
export function formatRatioAsPercent(ratio, fractionDigits = 0) {
  return formatPercent(ratio * 100, fractionDigits);
}

/** Formats a decimal score with a single decimal place. */
export function formatScore(value) {
  if (!Number.isFinite(value)) return '0.0';
  return value.toFixed(1);
}

/** Formats a number with locale-aware thousands separators. */
export function formatNumber(value) {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-IN').format(value);
}

/** Formats a duration expressed in minutes as `1h 25m`. */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);
  if (hours === 0) return `${remainder}m`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

/** Formats a byte count as a human readable file size. */
export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/** Returns the initials of a person name, capped at two characters. */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Truncates text to a maximum length, appending an ellipsis when cut. */
export function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text ?? '';
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

/** Capitalises the first character of a string. */
export function capitalise(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Converts a snake_case or kebab-case identifier into Title Case. */
export function humanise(value) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Clamps a number between a lower and an upper bound. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Calculates a percentage, guarding against division by zero. */
export function percentOf(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

/** Returns the plural suffix for a count, e.g. `3 modules`. */
export function pluralise(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
