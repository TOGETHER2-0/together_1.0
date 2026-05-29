export interface Location {
  id: string;
  name: string;
  category: 'accommodation' | 'bar' | 'campus' | 'outdoor' | 'other';
  latitude: number;
  longitude: number;
  address?: string;
}

export const LOCATIONS: Location[] = [
  // ── Accommodations ──────────────────────────────────────────
  {
    id: 'raslatt',
    name: 'Råslätt',
    category: 'accommodation',
    latitude: 57.7494,
    longitude: 14.1408,
    address: 'Råslätt, Jönköping',
  },
  {
    id: 'ekhagen',
    name: 'Ekhagen',
    category: 'accommodation',
    latitude: 57.7812,
    longitude: 14.1654,
    address: 'Ekhagen, Jönköping',
  },
  {
    id: 'delta',
    name: 'Delta',
    category: 'accommodation',
    latitude: 57.7723,
    longitude: 14.1589,
    address: 'Delta, Jönköping',
  },
  {
    id: 'kankapsfabriken',
    name: 'Kånkapsfabriken',
    category: 'accommodation',
    latitude: 57.7698,
    longitude: 14.1612,
    address: 'Odengatan 40, Jönköping',
  },

  // ── Campus ───────────────────────────────────────────────────
  {
    id: 'jibs',
    name: 'JIBS Campus',
    category: 'campus',
    latitude: 57.7815,
    longitude: 14.1685,
    address: 'Gjuterigatan 5, Jönköping',
  },
  {
    id: 'jth',
    name: 'JTH Campus',
    category: 'campus',
    latitude: 57.7802,
    longitude: 14.1701,
    address: 'Gjuterigatan 5, Jönköping',
  },
  {
    id: 'hlk',
    name: 'HLK Campus',
    category: 'campus',
    latitude: 57.7798,
    longitude: 14.1672,
    address: 'Barnarpsgatan 39, Jönköping',
  },
  {
    id: 'library',
    name: 'University Library',
    category: 'campus',
    latitude: 57.7808,
    longitude: 14.1693,
    address: 'Gjuterigatan 5, Jönköping',
  },

  // ── Bars & Social ────────────────────────────────────────────
  {
    id: 'sturekallaren',
    name: 'Sturekällaren',
    category: 'bar',
    latitude: 57.7797,
    longitude: 14.1597,
    address: 'Storgatan 26, Jönköping',
  },
  {
    id: 'bishops',
    name: "Bishop's Arms",
    category: 'bar',
    latitude: 57.7785,
    longitude: 14.1615,
    address: 'Hovrättstorget 9, Jönköping',
  },
  {
    id: 'dojon',
    name: 'Dojon',
    category: 'bar',
    latitude: 57.779,
    longitude: 14.1602,
    address: 'Östra Storgatan 4, Jönköping',
  },
  {
    id: 'studentkaren',
    name: 'Studentkåren',
    category: 'bar',
    latitude: 57.782,
    longitude: 14.166,
    address: 'Gjuterigatan, Jönköping',
  },

  // ── Outdoor ──────────────────────────────────────────────────
  {
    id: 'vattern',
    name: 'Vättern Lakeside',
    category: 'outdoor',
    latitude: 57.7765,
    longitude: 14.158,
    address: 'Vätterstranden, Jönköping',
  },
  {
    id: 'rockparken',
    name: 'Rockparken',
    category: 'outdoor',
    latitude: 57.778,
    longitude: 14.1555,
    address: 'Rockparken, Jönköping',
  },
  {
    id: 'stadsparken',
    name: 'Stadsparken',
    category: 'outdoor',
    latitude: 57.785,
    longitude: 14.17,
    address: 'Stadsparken, Jönköping',
  },
  {
    id: 'huskvarna',
    name: 'Huskvarna Beach',
    category: 'outdoor',
    latitude: 57.7882,
    longitude: 14.2651,
    address: 'Huskvarna, Jönköping',
  },

  // ── Other ────────────────────────────────────────────────────
  {
    id: 'city',
    name: 'Jönköping City Centre',
    category: 'other',
    latitude: 57.7826,
    longitude: 14.1618,
    address: 'City, Jönköping',
  },
  {
    id: 'elmia',
    name: 'Elmia',
    category: 'other',
    latitude: 57.7699,
    longitude: 14.1752,
    address: 'Elmiavägen 11, Jönköping',
  },
];

// Faculty list — JIBS, JTH, HLK, Hälso
export const FACULTIES = ['JIBS', 'JTH', 'HLK', 'Hälso'] as const;
export type Faculty = typeof FACULTIES[number];

export const CATEGORY_LABELS: Record<Location['category'], string> = {
  accommodation: 'Accommodation',
  bar:           'Bars & Social',
  campus:        'Campus',
  outdoor:       'Outdoor',
  other:         'Other',
};

export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find(l => l.id === id);
}

export function getLocationByName(name: string): Location | undefined {
  return LOCATIONS.find(l => l.name.toLowerCase() === name.toLowerCase());
}

/**
 * Returns { lat, lng } for a location string.
 * Checks the static dataset first, then falls back to the provided coords, then campus default.
 */
export function getCoordinatesForLocation(
  locationText: string,
  fallbackLat?: number,
  fallbackLng?: number,
): { lat: number; lng: number } {
  const loc = getLocationByName(locationText);
  if (loc) return { lat: loc.latitude, lng: loc.longitude };
  if (fallbackLat !== undefined && fallbackLng !== undefined) {
    return { lat: fallbackLat, lng: fallbackLng };
  }
  // Default: Jönköping University campus area
  return { lat: 57.7808, lng: 14.169 };
}

export function groupLocationsByCategory(): Record<string, Location[]> {
  return LOCATIONS.reduce((acc, loc) => {
    if (!acc[loc.category]) acc[loc.category] = [];
    acc[loc.category].push(loc);
    return acc;
  }, {} as Record<string, Location[]>);
}
