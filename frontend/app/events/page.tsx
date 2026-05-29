'use client';

import { detectCategory } from '@/lib/utils';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';
import { Event } from '@/lib/types';
import { useAuthStore } from '@/lib/store';
import EventCard from '@/components/events/EventCard';
import AppLayout from '@/components/layout/AppLayout';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function EventsPage() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch events
  useEffect(() => {
    eventsApi.list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setEvents(arr);
        setFilteredEvents(arr);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter events
  useEffect(() => {
    let filtered = Array.isArray(events) ? [...events] : [];

    if (search) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location_text.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(e => detectCategory(e.location_text) === selectedCategory);
    }

    setFilteredEvents(filtered);
  }, [search, selectedCategory, events]);

  const categories = [
    { id: 'accommodation', label: '🏠 Stays', color: '#FFB547' },
    { id: 'bar', label: '🍺 Bars', color: '#FF5E7D' },
    { id: 'campus', label: '🎓 Campus', color: '#7C5CFC' },
    { id: 'outdoor', label: '🌿 Outdoor', color: '#00E5B3' },
  ];

  return (
    <AppLayout>
      <div className="page-content">
        {/* Sticky Header */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 430,
            zIndex: 100,
            background: 'linear-gradient(180deg, var(--bg-base) 70%, rgba(8,8,16,0) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '16px 16px 12px',
            paddingTop: 'max(16px, calc(16px + var(--safe-top)))',
          }}
        >
          {/* Greeting + Avatar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3, fontWeight: 500 }}>
                {getGreeting()}
              </p>
              <h1 style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.025em',
              }}>
                What's on 🎉
              </h1>
            </div>
            <Link href="/profile">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: user?.avatar_color || 'var(--brand-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: `0 0 0 2px var(--border-subtle), 0 4px 12px rgba(124,92,252,0.2)`,
                  flexShrink: 0,
                }}
              >
                {user?.full_name?.charAt(0) || '?'}
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-elevated)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>🔍</span>
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: 16,
                    padding: '4px 0',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className="category-chip"
                style={{
                  borderColor: selectedCategory === cat.id ? `${cat.color}80` : 'var(--border-subtle)',
                  background: selectedCategory === cat.id ? `${cat.color}20` : 'transparent',
                  color: selectedCategory === cat.id ? cat.color : 'var(--text-secondary)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ paddingTop: 220, paddingLeft: 16, paddingRight: 16, paddingBottom: 'calc(var(--nav-height) + 16px + var(--safe-bottom))' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 60,
              paddingBottom: 60,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎈</div>
              <h2 style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                marginBottom: 8,
              }}>
                {search || selectedCategory ? 'No events found' : 'No events yet'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                {search || selectedCategory
                  ? 'Try adjusting your filters'
                  : 'Be the first to create one!'}
              </p>
              {!search && !selectedCategory && (
                <Link href="/events/new">
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 20px',
                    background: 'var(--brand-gradient)',
                    borderRadius: 'var(--radius-pill)',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                    ➕ Create Event
                  </div>
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
