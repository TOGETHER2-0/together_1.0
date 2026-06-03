'use client';

import { detectCategory } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/layout/AppLayout';
import { eventsApi } from '@/lib/api';
import { Event } from '@/lib/types';
import { getCoordinatesForLocation } from '@/lib/locations';
import { getFacultyColor } from '@/lib/faculties';
import Link from 'next/link';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

const CAT_EMOJI: Record<string, string> = {
  accommodation: '🏠',
  bar: '🍺',
  campus: '🎓',
  outdoor: '🌿',
  other: '📍',
};

export default function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await eventsApi.list() as any;
      const arr = Array.isArray(data) ? data : [];
      const upcoming = arr.filter((e: Event) => new Date(e.event_datetime) >= new Date());
      setEvents(upcoming);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const selectedEvent = events.find(e => e.id === selectedId) ?? null;

  function handleMarkerClick(event: Event) {
    setSelectedId(event.id);
    setSheetOpen(true);
  }

  return (
    <AppLayout>
      {/* Full-screen map */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
      }}>
        {loading ? (
          <div style={{
            width: '100%', height: '100%',
            background: 'var(--bg-base)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 44, height: 44,
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--brand-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading map…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <MapView
            events={events}
            selectedEventId={selectedId}
            onMarkerClick={handleMarkerClick}
            height="100dvh"
          />
        )}
      </div>

      {/* Header overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        zIndex: 50,
        padding: '52px 20px 16px',
        background: 'linear-gradient(to bottom, rgba(8,8,16,0.92) 40%, transparent)',
        pointerEvents: 'none',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22, fontWeight: 800,
          letterSpacing: '-0.03em', marginBottom: 4,
        }}>
          Nearby Events
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {events.length} upcoming around Jönköping
        </p>
      </div>

      {/* Category count chips */}
      {!sheetOpen && events.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          gap: 8, flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '0 20px',
          maxWidth: 430, width: '100%',
          pointerEvents: 'none',
        }}>
          {Object.entries(
            events.reduce((acc, e) => {
              const cat = detectCategory(e.location_text);
              acc[cat] = (acc[cat] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([cat, count]) => (
            <div key={cat} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(15,15,28,0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
              fontSize: 12, fontWeight: 600,
              pointerEvents: 'all',
            }}>
              <span>{CAT_EMOJI[cat]}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: `translateX(-50%) translateY(${sheetOpen && selectedEvent ? '0%' : '110%'})`,
        width: '100%', maxWidth: 430,
        zIndex: 60,
        transition: 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
        padding: '0 16px 100px',
      }}>
        {selectedEvent && (
          <EventPreviewSheet
            event={selectedEvent}
            onClose={() => { setSelectedId(null); setSheetOpen(false); }}
          />
        )}
      </div>
    </AppLayout>
  );
}

function EventPreviewSheet({ event, onClose }: { event: Event; onClose: () => void }) {
  const category = detectCategory(event.location_text);
  const catEmoji = CAT_EMOJI[category];
  const catColor = getFacultyColor(event.host?.faculty);
  const eventDate = new Date(event.event_datetime);
  const approved = event.join_requests?.filter(r => r.status === 'approved').length ?? 0;
  const capacity = event.max_participants;
  const isFull = capacity ? approved >= capacity : false;
  const spotsLeft = capacity ? capacity - approved : null;

  return (
    <div style={{
      background: 'rgba(15,15,28,0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${catColor}, ${catColor}66)` }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: `${catColor}18`, border: `1px solid ${catColor}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>
              {catEmoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800,
                color: 'var(--text-primary)', letterSpacing: '-0.02em',
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              }}>
                {event.title}
              </h3>
              <p style={{
                fontSize: 12, color: 'var(--text-muted)', marginTop: 2,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              }}>
                {event.location_text}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, border: 'none',
            background: 'var(--bg-elevated)', borderRadius: '50%',
            color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginLeft: 10,
          }}>×</button>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
            📅 {eventDate.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}
            {' · '}
            {eventDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          {capacity && (
            <div style={{
              fontSize: 12, fontWeight: 600,
              color: isFull ? '#FF5E7D' : '#00E5B3',
              background: isFull ? 'rgba(255,94,125,0.10)' : 'rgba(0,229,179,0.10)',
              border: `1px solid ${isFull ? 'rgba(255,94,125,0.22)' : 'rgba(0,229,179,0.22)'}`,
              borderRadius: 999, padding: '3px 10px',
            }}>
              {isFull ? `Full (${capacity})` : `${spotsLeft} spots left`}
            </div>
          )}
        </div>

        {/* Host */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: getFacultyColor(event.host?.faculty),
            color: '#fff', fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {event.host?.full_name?.charAt(0) || '?'}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Hosted by <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {event.host?.full_name}
            </span>
          </span>
        </div>

        {/* CTA */}
        <Link href={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary btn-block" style={{ height: 48 }}>
            View Event →
          </button>
        </Link>
      </div>
    </div>
  );
}
