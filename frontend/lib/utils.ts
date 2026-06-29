// ─── Date helpers ─────────────────────────────────────────────

export function formatEventDate(datetime: string): string {
  const d = new Date(datetime);
  return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatEventTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString('en', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function formatEventDateLong(datetime: string): string {
  const d = new Date(datetime);
  return d.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function isUpcoming(datetime: string): boolean {
  return new Date(datetime) >= new Date();
}

// Single canonical countdown — "in 12m" / "in 3h" / "Tomorrow" / "in 5d" /
// "23 Mar". Used by every surface so relative time reads identically app-wide.
export function timeUntil(datetime: string): string {
  const diff = new Date(datetime).getTime() - Date.now();
  if (diff <= 0) return 'Now';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `in ${days}d`;
  return new Date(datetime).toLocaleDateString('en', { day: 'numeric', month: 'short' });
}

// Single canonical short date+time — "Sat 23 Mar · 14:00".
export function eventWhen(datetime: string): string {
  const d = new Date(datetime);
  return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })
    + ' · ' + d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// ─── Color helpers ────────────────────────────────────────────

// Single canonical hex→rgba. Accepts #RGB / #RRGGBB and falls back to the
// brand violet for anything non-hex (e.g. a CSS var string), so callers can
// pass either an avatar_color hex or a faculty/brand fallback safely.
export function hexToRgba(hex: string | null | undefined, a: number): string {
  if (!hex || !hex.startsWith('#')) return `rgba(124, 58, 237, ${a})`;
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(f, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// ─── String helpers ───────────────────────────────────────────

export function getInitials(fullName?: string | null): string {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function parseApiError(err: any): string {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ');
  return 'Something went wrong. Please try again.';
}
