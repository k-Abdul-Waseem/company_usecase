/** Client-side export helpers. No backend is required. */

function escapeCell(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Serialises rows to CSV and triggers a browser download.
 * @param {string} filename
 * @param {Array<{key: string, label: string}>} columns
 * @param {Array<Record<string, unknown>>} rows
 */
export function downloadCsv(filename, columns, rows) {
  const header = columns.map((column) => escapeCell(column.label)).join(',');
  const body = rows
    .map((row) => columns.map((column) => escapeCell(row[column.key])).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
