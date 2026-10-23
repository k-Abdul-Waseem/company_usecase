/** Identifier and timing helpers used by the mock adapters and UI. */

/** Returns a collision-resistant identifier with a readable prefix. */
export function createId(prefix = 'id') {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}-${random}`;
}

/** Returns a random integer between min and max (inclusive). */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Picks a random entry from a non-empty array. */
export function pickOne(items) {
  return items[Math.floor(Math.random() * items.length)];
}

/** Resolves after the supplied number of milliseconds. */
export function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Deep clones plain JSON-compatible data. */
export function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
