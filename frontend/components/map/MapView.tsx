'use client';

import { useEffect, useRef, useState } from 'react';
import { Event } from '@/lib/types';
import { getCoordinatesForLocation } from '@/lib/locations';
import { getFacultyColor, getFacultyShort } from '@/lib/faculties';

interface Props {
  events: Event[];
  selectedEventId?: number | null;
  onMarkerClick?: (event: Event) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

function getEventCoords(event: Event): [number, number] {
  if (event.latitude && event.longitude &&
      Math.abs(event.latitude) > 0.001 && Math.abs(event.longitude) > 0.001) {
    return [event.latitude, event.longitude];
  }
  if (event.location_text) {
    const c = getCoordinatesForLocation(event.location_text);
    return [c.lat, c.lng];
  }
  return [57.7808, 14.169];
}

function buildMarkerHtml(color: string, initial: string, selected: boolean): string {
  const size = selected ? 52 : 42;
  const fontSize = selected ? 16 : 13;

  return `
    <div style="position:relative;width:${size}px;height:${size}px;">
      ${selected ? `
        <div style="
          position:absolute;inset:-8px;border-radius:50%;
          background:${color};opacity:0.25;
          animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
      ` : ''}
      <div style="
        width:${size}px;height:${size}px;
        background:linear-gradient(145deg,${color},${color}CC);
        border-radius:50% 50% 50% 4px;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 6px 20px ${color}55,0 0 0 2px rgba(255,255,255,0.15),inset 0 1px 0 rgba(255,255,255,0.2);
        cursor:pointer;
        animation:markerPop 0.38s cubic-bezier(0.34,1.56,0.64,1) both;
      ">
        <span style="
          font-size:${fontSize}px;font-weight:800;
          color:${color === '#FACC15' || color === '#E2E8F0' ? '#0A0A14' : '#fff'};
          font-family:'Syne',sans-serif;
          letter-spacing:-0.02em;
          line-height:1;
        ">${initial}</span>
      </div>
    </div>
  `;
}

function buildPopupHtml(event: Event): string {
  const color    = getFacultyColor(event.host?.faculty);
  const faculty  = event.host?.faculty || '';
  const shortFac = getFacultyShort(event.host?.faculty);
  const initial  = event.host?.full_name?.charAt(0)?.toUpperCase() || '?';
  const textColor = faculty === 'JTH' || faculty === 'Hälso' ? '#0A0A14' : '#fff';

  const approved  = event.join_requests?.filter(r => r.status === 'approved').length ?? 0;
  const capacity  = event.max_participants;
  const date      = new Date(event.event_datetime);
  const dateStr   = date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr   = date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
  const isFull    = capacity ? approved >= capacity : false;
  const spotsLeft = capacity ? capacity - approved : null;
  const fillPct   = capacity ? Math.min((approved / capacity) * 100, 100) : 0;

  return `
    <div onclick="window.location.href='/events/${event.id}'"
      style="width:260px;background:rgba(15,15,28,0.98);cursor:pointer;font-family:'DM Sans',sans-serif;">

      <div style="height:3px;background:linear-gradient(90deg,${color},${color}55);"></div>

      <div style="padding:16px;">
        <!-- Header -->
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
          <!-- Avatar -->
          <div style="
            width:40px;height:40px;border-radius:12px;flex-shrink:0;
            background:linear-gradient(145deg,${color},${color}CC);
            display:flex;align-items:center;justify-content:center;
            font-size:16px;font-weight:800;color:${textColor};
            font-family:'Syne',sans-serif;
            box-shadow:0 4px 12px ${color}40;
          ">${initial}</div>

          <div style="flex:1;min-width:0;">
            <div style="
              font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
              color:#EEEEFF;letter-spacing:-0.025em;line-height:1.25;
              overflow:hidden;display:-webkit-box;
              -webkit-line-clamp:2;-webkit-box-orient:vertical;
              margin-bottom:4px;
            ">${event.title}</div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="
                font-size:9px;font-weight:800;
                color:${color};background:${color}18;
                border:1px solid ${color}30;border-radius:999px;
                padding:2px 7px;letter-spacing:0.04em;
                font-family:'Syne',sans-serif;
              ">${shortFac}</span>
              <span style="font-size:11px;color:#8888AA;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
                ${event.location_text}
              </span>
            </div>
          </div>
        </div>

        <!-- Date pill -->
        <div style="
          display:flex;align-items:center;gap:6px;
          padding:8px 12px;background:rgba(255,255,255,0.04);
          border-radius:10px;margin-bottom:12px;
        ">
          <span style="font-size:13px;">📅</span>
          <span style="font-size:12px;color:#EEEEFF;font-weight:500;">${dateStr}</span>
          <span style="font-size:12px;color:#8888AA;margin-left:auto;">${timeStr}</span>
        </div>

        ${capacity ? `
          <!-- Capacity -->
          <div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:11px;color:#8888AA;">${approved} / ${capacity} going</span>
              <span style="
                font-size:11px;font-weight:700;
                color:${isFull ? '#FF5E7D' : '#00E5B3'};
                background:${isFull ? 'rgba(255,94,125,0.12)' : 'rgba(0,229,179,0.12)'};
                border:1px solid ${isFull ? 'rgba(255,94,125,0.25)' : 'rgba(0,229,179,0.25)'};
                border-radius:999px;padding:3px 8px;
                letter-spacing:0.03em;text-transform:uppercase;
              ">${isFull ? 'Full' : `${spotsLeft} left`}</span>
            </div>
            <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:999px;overflow:hidden;">
              <div style="
                width:${fillPct}%;height:100%;border-radius:999px;
                background:${isFull
                  ? 'linear-gradient(90deg,#FF3357,#FF5E7D)'
                  : `linear-gradient(90deg,${color},${color}BB)`};
              "></div>
            </div>
          </div>
        ` : ''}

        <!-- CTA -->
        <div style="
          text-align:center;padding:10px;
          background:${color}15;border:1px solid ${color}25;
          border-radius:12px;font-size:13px;font-weight:600;color:${color};
        ">View event →</div>
      </div>
    </div>
  `;
}

export default function MapView({
  events, selectedEventId, onMarkerClick,
  height = '100%', center, zoom = 14,
}: Props) {
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef     = useRef<Map<number, any>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Init map
useEffect(() => {
  if (typeof window === 'undefined' || !mapRef.current) return;

  // Leaflet attaches _leaflet_id to the container — use it as guard
  const container = mapRef.current as any;
  if (container._leaflet_id) {
    container._leaflet_id = null;
  }

  let map: any = null;

  import('leaflet').then((L) => {
    if (!mapRef.current) return;
    
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    try {
      map = L.map(mapRef.current, {
        center: center || [57.7808, 14.169],
        zoom,
        zoomControl: true,
        attributionControl: false,
        zoomAnimation: true,
        fadeAnimation: true,
      });
    } catch {
      return;
    }

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
}).addTo(map);

    if (!document.getElementById('map-keyframes')) {
      const style = document.createElement('style');
      style.id = 'map-keyframes';
      style.textContent = `
        @keyframes ping { 75%,100% { transform:scale(2.2); opacity:0; } }
        @keyframes markerPop {
          0%   { transform:scale(0); opacity:0; }
          70%  { transform:scale(1.15); opacity:1; }
          100% { transform:scale(1); opacity:1; }
        }
        .leaflet-tile-pane { filter:brightness(0.92) saturate(0.75) contrast(1.05); }
      `;
      document.head.appendChild(style);
    }

    mapInstanceRef.current = map;
    setIsLoaded(true);
  });

  return () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersRef.current.clear();
      setIsLoaded(false);
    }
  };
}, []);

  // Render markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      const activeIds = new Set<number>();

      events.forEach((event) => {
        const coords   = getEventCoords(event);
        const selected = event.id === selectedEventId;
        const color    = getFacultyColor(event.host?.faculty);
        const initial  = event.host?.full_name?.charAt(0)?.toUpperCase() || '?';
        const size     = selected ? 52 : 42;

        const icon = L.divIcon({
          html: buildMarkerHtml(color, initial, selected),
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
          popupAnchor: [0, -(size + 6)],
        });

        if (markersRef.current.has(event.id)) {
          const marker = markersRef.current.get(event.id)!;
          marker.setLatLng(coords);
          marker.setIcon(icon);
          marker.getPopup()?.setContent(buildPopupHtml(event));
        } else {
          const marker = L.marker(coords, { icon });

          marker.bindPopup(buildPopupHtml(event), {
            maxWidth: 280, minWidth: 260,
            closeButton: false,
          });

          marker.on('click', () => onMarkerClick?.(event));
          marker.addTo(map);
          markersRef.current.set(event.id, marker);
        }

        activeIds.add(event.id);
      });

      // Remove stale markers
      markersRef.current.forEach((marker, id) => {
        if (!activeIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });
    });
  }, [events, isLoaded, selectedEventId]);

  // Fly to selected
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !selectedEventId) return;
    const event = events.find(e => e.id === selectedEventId);
    if (!event) return;
    const [lat, lng] = getEventCoords(event);
    mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true, duration: 0.7 });
    const marker = markersRef.current.get(selectedEventId);
    if (marker) setTimeout(() => marker.openPopup(), 500);
  }, [selectedEventId, isLoaded, events]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {!isLoaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--bg-base)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 14, zIndex: 10,
        }}>
          <div style={{
            width: 48, height: 48,
            background: 'var(--brand-gradient)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 4,
            boxShadow: 'var(--shadow-brand)',
          }}>🗺️</div>
          <div className="spinner" style={{ color: 'var(--brand-primary)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
            Loading map…
          </span>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
