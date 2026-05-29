// ─── Single source of truth for category detection and colors ─

export type Category = 'accommodation' | 'campus' | 'bar' | 'outdoor' | 'other';

export const CATEGORY_META: Record<Category, {
  color: string;
  dim: string;
  border: string;
  icon: string;
  label: string;
}> = {
  accommodation: {
    color:  '#FFB547',
    dim:    'rgba(255,181,71,0.12)',
    border: 'rgba(255,181,71,0.25)',
    icon:   '🏠',
    label:  'Accommodation',
  },
  campus: {
    color:  '#7C5CFC',
    dim:    'rgba(124,92,252,0.12)',
    border: 'rgba(124,92,252,0.25)',
    icon:   '🎓',
    label:  'Campus',
  },
  bar: {
    color:  '#FF5E7D',
    dim:    'rgba(255,94,125,0.12)',
    border: 'rgba(255,94,125,0.25)',
    icon:   '🍺',
    label:  'Social',
  },
  outdoor: {
    color:  '#00E5B3',
    dim:    'rgba(0,229,179,0.12)',
    border: 'rgba(0,229,179,0.25)',
    icon:   '🌿',
    label:  'Outdoor',
  },
  other: {
    color:  '#60A5FA',
    dim:    'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.25)',
    icon:   '📍',
    label:  'Other',
  },
};

const ACCOMMODATION_KEYWORDS = ['råslätt','ekhagen','delta','kånkapsfabriken'];
const CAMPUS_KEYWORDS         = ['jibs','jth','hlk','campus','library'];
const BAR_KEYWORDS            = ['bishop','sturekäll','dojon','norrby','bar','spegeln','village','monk'];
const OUTDOOR_KEYWORDS        = ['vättern','park','beach','huskvarna','rock','skog'];

export function detectCategory(locationText: string): Category {
  const l = (locationText || '').toLowerCase();
  if (ACCOMMODATION_KEYWORDS.some(k => l.includes(k))) return 'accommodation';
  if (CAMPUS_KEYWORDS.some(k => l.includes(k)))         return 'campus';
  if (BAR_KEYWORDS.some(k => l.includes(k)))            return 'bar';
  if (OUTDOOR_KEYWORDS.some(k => l.includes(k)))        return 'outdoor';
  return 'other';
}

export function getCategoryMeta(locationText: string) {
  return CATEGORY_META[detectCategory(locationText)];
}

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
