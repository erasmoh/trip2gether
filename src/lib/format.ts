// Date/label helpers. Dates are treated as calendar dates (no timezone shifts)
// by parsing the ISO YYYY-MM-DD parts directly.

const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const WEEKDAYS_ES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDayLabel(iso: string): string {
  const date = parseDate(iso);
  return `${WEEKDAYS_ES[date.getDay()]} ${date.getDate()} ${MONTHS_ES[date.getMonth()]}`;
}

export function formatDateRange(startIso: string, endIso: string): string {
  const start = parseDate(startIso);
  const end = parseDate(endIso);
  const startStr = `${start.getDate()} ${MONTHS_ES[start.getMonth()]}`;
  const endStr = `${end.getDate()} ${MONTHS_ES[end.getMonth()]} ${end.getFullYear()}`;
  return `${startStr} – ${endStr}`;
}

export function tripLengthDays(startIso: string, endIso: string): number {
  const start = parseDate(startIso);
  const end = parseDate(endIso);
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `hace ${diffD} d`;
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS_ES[date.getMonth()]}`;
}
