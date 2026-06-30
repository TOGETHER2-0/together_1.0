'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, X, MapPin, Clock, ArrowUpRight, Plus } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { Event } from '@/lib/types';
import { timeUntil, hexToRgba } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import AppShell from '@/components/layout/AppShell';
import EventCard from '@/components/events/EventCard';

/* ─── Time helpers ───────────────────────────────────────────── */

function sectionFor(iso: string): 'tonight' | 'this week' | 'later' {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'tonight';
  if (d.getTime() <= now.getTime() + 7 * 86400000) return 'this week';
  return 'later';
}

/* ─── Discover — the full JU universe ────────────────────────── */

export default function DiscoverPage() {
  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    eventsApi.list()
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = events
    .filter(e => new Date(e.event_datetime) >= now)
    .sort((a, b) => +new Date(a.event_datetime) - +new Date(b.event_datetime));

  const q = search.trim().toLowerCase();
  const filtered = upcoming
    .filter(e =>
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.location_text.toLowerCase().includes(q) ||
      (e.description ?? '').toLowerCase().includes(q)
    );

  const searching = q.length > 0;
  const spotlight = !searching && filtered.length > 0 ? filtered[0] : null;
  const feed      = spotlight ? filtered.slice(1) : filtered;

  const groups: { label: string; events: Event[] }[] = [];
  for (const label of ['tonight', 'this week', 'later'] as const) {
    const evs = feed.filter(e => sectionFor(e.event_datetime) === label);
    if (evs.length) groups.push({ label, events: evs });
  }

  const tonightCount = upcoming.filter(e => sectionFor(e.event_datetime) === 'tonight').length;
  const weekCount    = upcoming.filter(e => sectionFor(e.event_datetime) !== 'later').length;

  return (
    <AppShell>
      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(9,9,26,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid var(--border-subtle)',
        padding: '20px 20px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
              letterSpacing: '-0.04em', color: 'var(--text-primary)', margin: 0,
            }}>
              explore
            </h1>
            {!loading && weekCount > 0 && (
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                {tonightCount > 0
                  ? <><span style={{ color: 'var(--accent-go)', fontWeight: 700 }}>{tonightCount} tonight</span> · {weekCount} this week</>
                  : <>{weekCount} this week</>}
              </span>
            )}
          </div>
          <Link href="/events/new" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 13, fontWeight: 700, color: 'var(--brand-mid)',
            textDecoration: 'none', padding: '6px 12px',
            background: 'rgba(124,58,237,0.10)', borderRadius: 10,
            border: '0.5px solid rgba(124,58,237,0.25)',
          }}>
            <Plus size={14} strokeWidth={2.4} /> host
          </Link>
        </div>

        {/* ── Search ──────────────────────────────────────────── */}
        <div className="search-bar" style={{ marginBottom: 14 }}>
          <Search size={15} strokeWidth={1.75} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search events, places, people…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Clear search" style={{
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', width: 20, height: 20, padding: 0, alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>

        <div style={{ height: 6 }} />
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div style={{ padding: '16px 20px 36px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton" style={{ height: 168, borderRadius: 17 }} />
            {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 17 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: 12, padding: '64px 24px',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: 'var(--bg-elevated)',
              border: '0.5px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Search size={22} color="var(--text-muted)" />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {searching ? 'Nothing matches' : 'No events yet'}
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 230 }}>
                {searching ? 'Try a different search' : 'Be the first to create one'}
              </p>
            </div>
            {!searching && (
              <Link href="/events/new" style={{
                marginTop: 2, padding: '12px 22px', background: 'var(--brand-primary)',
                borderRadius: 'var(--radius-pill)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
              }}>
                Create event
              </Link>
            )}
          </div>
        ) : (
          <>
            {spotlight && <Spotlight event={spotlight} />}

            {searching && filtered.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 23, fontWeight: 800,
                    letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.30)',
                  }}>
                    results
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.30)' }}>
                    {filtered.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filtered.map(event => <EventCard key={event.id} event={event} />)}
                </div>
              </div>
            )}

            {!searching && groups.map(({ label, events: evs }, gi) => {
              const lead = gi === 0;
              return (
                <div key={label} style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                    {label === 'tonight' && (
                      <span style={{ position: 'relative', width: 7, height: 7, alignSelf: 'center', flexShrink: 0 }}>
                        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent-go)', animation: 'liveRing 1.6s ease-out infinite' }} />
                        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent-go)' }} />
                      </span>
                    )}
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: lead ? 28 : 23, fontWeight: 800,
                      letterSpacing: '-0.04em', lineHeight: 1,
                      color: lead ? 'var(--text-primary)' : 'rgba(255,255,255,0.30)',
                    }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: label === 'tonight' ? 'var(--brand-mid)' : 'rgba(255,255,255,0.30)',
                    }}>{evs.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {evs.map(event => <EventCard key={event.id} event={event} />)}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </AppShell>
  );
}

/* ─── Spotlight — the next thing happening, led by its people ─── */

function spotTier(n: number) {
  if (n <= 2) return { host: 46, face: 38, step: 4,   max: Math.max(n, 0) };
  if (n <= 5) return { host: 42, face: 34, step: -10, max: 5 };
  return         { host: 40, face: 32, step: -14, max: 6 };
}

function wobble(seed: string | number): number {
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (((h % 5) + 5) % 5) - 2;
}

function Spotlight({ event }: { event: Event }) {
  const approved  = event.join_requests?.filter(r => r.status === 'approved') ?? [];
  const host      = event.host;
  const hostColor = host.avatar_color || '#7C3AED';
  const d         = new Date(event.event_datetime);
  const diffH     = (d.getTime() - Date.now()) / 3_600_000;
  const live      = diffH <= 3;

  const count   = approved.length;
  const tier    = spotTier(count);
  const visible = approved.slice(0, tier.max);
  const overflow = count - tier.max;

  const firstName  = (n: string) => n.trim().split(' ')[0];
  const goingLabel = (() => {
    const names = approved.map(r => firstName(r.user.full_name));
    if (names.length === 1) return `${names[0]} is going`;
    if (names.length === 2) return `${names[0]} · ${names[1]} going`;
    return `${names[0]} · ${names[1]} · and ${names.length - 2} more`;
  })();

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 26 }}>
      <div style={{
        background: `radial-gradient(140% 100% at 0% 0%, ${hexToRgba(hostColor, 0.18)} 0%, transparent 56%), var(--bg-card)`,
        border: `0.5px solid ${hexToRgba(hostColor, 0.34)}`,
        borderRadius: 17, padding: '18px 18px 17px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block' }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: live ? 'var(--accent-live)' : 'var(--accent-go)', animation: 'liveRing 1.6s ease-out infinite' }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: live ? 'var(--accent-live)' : 'var(--accent-go)', animation: 'livePulse 1.6s ease-in-out infinite' }} />
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {live ? 'Starting soon' : 'Up next'}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
            {timeUntil(event.event_datetime)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ zIndex: 99 }}>
                <Avatar name={host.full_name} color={hostColor} url={host.avatar_url} size={tier.host} ringColor={hostColor} ringWidth={3} />
              </div>
              {count > 0 ? (
                <>
                  {visible.map((r, i) => (
                    <div key={r.id} style={{ marginLeft: tier.step, zIndex: 50 - i, transform: `translateY(${wobble(r.user.id)}px)` }}>
                      <Avatar name={r.user.full_name} color={r.user.avatar_color} url={r.user.avatar_url} size={tier.face} ringColor="var(--bg-card)" ringWidth={2.5} />
                    </div>
                  ))}
                  {overflow > 0 && (
                    <div style={{
                      width: tier.face, height: tier.face, borderRadius: '50%', marginLeft: tier.step, background: 'var(--bg-elevated)',
                      border: '2.5px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-primary)', fontSize: Math.round(tier.face * 0.32), fontWeight: 800, zIndex: 0,
                    }}>+{overflow}</div>
                  )}
                </>
              ) : (
                <div style={{
                  width: tier.face, height: tier.face, borderRadius: '50%', marginLeft: tier.step,
                  background: hexToRgba(hostColor, 0.16), border: `1.5px dashed ${hexToRgba(hostColor, 0.55)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: hexToRgba(hostColor, 0.95), fontSize: Math.round(tier.face * 0.5), fontWeight: 700, zIndex: 0,
                }}>+</div>
              )}
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {count > 0 ? goingLabel : 'Be the first to join'}
            </span>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--brand-mid)', flexShrink: 0 }}>
            View <ArrowUpRight size={16} />
          </span>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          letterSpacing: '-0.03em', lineHeight: 1.18, color: 'var(--text-primary)', marginBottom: 8,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        } as React.CSSProperties}>
          {event.title}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--text-muted)', fontSize: 12.5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={13} />
            {d.toLocaleDateString('en', { weekday: 'short' })} {d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' }}>
            <MapPin size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.location_text}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

