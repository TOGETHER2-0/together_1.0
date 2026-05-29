// ─── Single source of truth for faculties ────────────────────
// Import from here in EVERY component that needs faculty data.
// Never hardcode faculty names or colors elsewhere.

export const FACULTIES = [
  'JIBS',
  'JTH',
  'Hälso',
  'School of Communication',
  'School of Education',
] as const;

export type Faculty = typeof FACULTIES[number];

export const FACULTY_COLORS: Record<Faculty, string> = {
  'JIBS':                    '#4ADE80', // green
  'JTH':                     '#FACC15', // yellow
  'Hälso':                   '#E2E8F0', // pearl white (readable on dark bg)
  'School of Communication': '#60A5FA', // blue
  'School of Education':     '#F87171', // red
};

export const FACULTY_COLORS_DIM: Record<Faculty, string> = {
  'JIBS':                    'rgba(74,222,128,0.12)',
  'JTH':                     'rgba(250,204,21,0.12)',
  'Hälso':                   'rgba(226,232,240,0.10)',
  'School of Communication': 'rgba(96,165,250,0.12)',
  'School of Education':     'rgba(248,113,113,0.12)',
};

export const FACULTY_COLORS_BORDER: Record<Faculty, string> = {
  'JIBS':                    'rgba(74,222,128,0.28)',
  'JTH':                     'rgba(250,204,21,0.28)',
  'Hälso':                   'rgba(226,232,240,0.20)',
  'School of Communication': 'rgba(96,165,250,0.28)',
  'School of Education':     'rgba(248,113,113,0.28)',
};

/**
 * Returns the primary color for a faculty.
 * Falls back to brand purple if faculty is unknown/null.
 */
export function getFacultyColor(faculty?: string | null): string {
  if (!faculty) return '#7C5CFC';
  return FACULTY_COLORS[faculty as Faculty] ?? '#7C5CFC';
}

/**
 * Returns dim background color (for cards, badges).
 */
export function getFacultyColorDim(faculty?: string | null): string {
  if (!faculty) return 'rgba(124,92,252,0.12)';
  return FACULTY_COLORS_DIM[faculty as Faculty] ?? 'rgba(124,92,252,0.12)';
}

/**
 * Returns border color for a faculty.
 */
export function getFacultyColorBorder(faculty?: string | null): string {
  if (!faculty) return 'rgba(124,92,252,0.28)';
  return FACULTY_COLORS_BORDER[faculty as Faculty] ?? 'rgba(124,92,252,0.28)';
}

/**
 * Short display label — used in tight UI spaces like badges.
 */
export const FACULTY_SHORT: Record<Faculty, string> = {
  'JIBS':                    'JIBS',
  'JTH':                     'JTH',
  'Hälso':                   'Hälso',
  'School of Communication': 'SoC',
  'School of Education':     'SoE',
};

export function getFacultyShort(faculty?: string | null): string {
  if (!faculty) return '?';
  return FACULTY_SHORT[faculty as Faculty] ?? faculty;
}
