/**
 * Conditional class name builder. A tiny local implementation avoids pulling in
 * a utility dependency while still supporting the `clsx` calling convention.
 */
export function cn(...inputs) {
  const out = [];

  const walk = (value) => {
    if (!value) return;
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, enabled]) => {
        if (enabled) out.push(key);
      });
    }
  };

  inputs.forEach(walk);
  return out.join(' ');
}
