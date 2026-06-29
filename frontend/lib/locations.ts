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
    latitude: 57.7412,     // south Jönköping, Råslätt suburb
    longitude: 14.1438,
    address: 'Råslätt, Jönköping',
  },
  {
    id: 'ekhagen',
    name: 'Ekhagen',
    category: 'accommodation',
    latitude: 57.7831,     // north of campus near Ekhagen road
    longitude: 14.1621,
    address: 'Ekhagen, Jönköping',
  },
  {
    id: 'delta',
    name: 'Delta',
    category: 'accommodation',
    latitude: 57.7756,     // between city and campus
    longitude: 14.1565,
    address: 'Delta, Jönköping',
  },
  {
    id: 'kankapsfabriken',
    name: 'Kånkapsfabriken',
    category: 'accommodation',
    latitude: 57.7702,
    longitude: 14.1608,
    address: 'Odengatan 40, Jönköping',
  },

  // ── Campus ───────────────────────────────────────────────────
  {
    id: 'jibs',
    name: 'JIBS Campus',
    category: 'campus',
    latitude: 57.7822,     // Gjuterigatan 5
    longitude: 14.1680,
    address: 'Gjuterigatan 5, Jönköping',
  },
  {
    id: 'jth',
    name: 'JTH Campus',
    category: 'campus',
    latitude: 57.7818,
    longitude: 14.1695,
    address: 'Gjuterigatan 5, Jönköping',
  },
  {
    id: 'hlk',
    name: 'HLK Campus',
    category: 'campus',
    latitude: 57.7812,     // Barnarpsgatan 39 — slightly west of JIBS
    longitude: 14.1662,
    address: 'Barnarpsgatan 39, Jönköping',
  },
  {
    id: 'library',
    name: 'University Library',
    category: 'campus',
    latitude: 57.7820,
    longitude: 14.1688,
    address: 'Gjuterigatan 5, Jönköping',
  },

  // ── Bars & Social ────────────────────────────────────────────
  {
    id: 'sturekallaren',
    name: 'Sturekällaren',
    category: 'bar',
    latitude: 57.7800,
    longitude: 14.1594,
    address: 'Storgatan 26, Jönköping',
  },
  {
    id: 'bishops',
    name: "Bishop's Arms",
    category: 'bar',
    latitude: 57.7784,
    longitude: 14.1618,
    address: 'Hovrättstorget 9, Jönköping',
  },
  {
    id: 'dojon',
    name: 'Dojon',
    category: 'bar',
    latitude: 57.7793,
    longitude: 14.1601,
    address: 'Östra Storgatan 4, Jönköping',
  },
  {
    id: 'studentkaren',
    name: 'Studentkåren',
    category: 'bar',
    latitude: 57.7826,
    longitude: 14.1668,
    address: 'Gjuterigatan, Jönköping',
  },

  // ── Outdoor ──────────────────────────────────────────────────
  {
    id: 'vattern',
    name: 'Vättern Lakeside',
    category: 'outdoor',
    latitude: 57.7768,
    longitude: 14.1548,   // near Vättern shore, Jönköping west
    address: 'Vätterstranden, Jönköping',
  },
  {
    id: 'rockparken',
    name: 'Rockparken',
    category: 'outdoor',
    latitude: 57.7783,
    longitude: 14.1540,
    address: 'Rockparken, Jönköping',
  },
  {
    id: 'stadsparken',
    name: 'Stadsparken',
    category: 'outdoor',
    latitude: 57.7849,
    longitude: 14.1698,
    address: 'Stadsparken, Jönköping',
  },
  {
    id: 'huskvarna',
    name: 'Huskvarna Beach',
    category: 'outdoor',
    latitude: 57.7869,
    longitude: 14.2703,   // Huskvarna is east of Jönköping city
    address: 'Huskvarna, Jönköping',
  },

  // ── Other ────────────────────────────────────────────────────
  {
    id: 'city',
    name: 'Jönköping City Centre',
    category: 'other',
    latitude: 57.7821,
    longitude: 14.1615,
    address: 'City, Jönköping',
  },
  {
    id: 'elmia',
    name: 'Elmia',
    category: 'other',
    latitude: 57.7680,
    longitude: 14.1762,
    address: 'Elmiavägen 11, Jönköping',
  },
];

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
  return { lat: 57.7822, lng: 14.1680 }; // JU campus default
}

export function groupLocationsByCategory(): Record<string, Location[]> {
  return LOCATIONS.reduce((acc, loc) => {
    if (!acc[loc.category]) acc[loc.category] = [];
    acc[loc.category].push(loc);
    return acc;
  }, {} as Record<string, Location[]>);
}
