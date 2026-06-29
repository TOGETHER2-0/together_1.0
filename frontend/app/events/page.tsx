'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Plus, Users, ChevronRight, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { Event } from '@/lib/types';
import { useAuthStore } from '@/lib/store';
import { useNotificationStore } from '@/lib/notifications';
import { timeUntil, hexToRgba } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import AppShell from '@/components/layout/AppShell';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay';

/* ─── Colour math ────────────────────────────────────────────── */

function mapsUrl(e: Event): string {
  if (e.latitude != null && e.longitude != null)
    return `https://www.google.com/maps/search/?api=1&query=${e.latitude},${e.longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location_text || '')}`;
}

/* ─── Time ───────────────────────────────────────────────────── */

function shortTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  const time  = d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (today) return time;
  const day = d.toLocaleDateString('en', { weekday: 'short' });
  return `${day} ${time}`;
}


/* ─── HomePage ───────────────────────────────────────────────── */

export default function HomePage() {
  const { user }    = useAuthStore();
  const unreadCount = useNotificationStore(s => s.unreadCount);

  const [events, setEvents]       = useState<Event[]>([]);
  const [loading, setLoading]     = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    eventsApi.list()
      .then(d => setEvents(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const me  = user?.id;
  const now = new Date();

  const upcoming = events
    .filter(e => new Date(e.event_datetime) >= now)
    .sort((a, b) => +new Date(a.event_datetime) - +new Date(b.event_datetime));

  const inCircle = (e: Event) =>
    e.host.id === me ||
    e.join_requests.some(r => r.user.id === me && r.status === 'approved');

  const circle  = upcoming.filter(inCircle);
  const atJU    = upcoming.filter(e =>
    !inCircle(e) &&
    !e.join_requests.some(r => r.user.id === me && r.status === 'pending')
  );
  const pending = upcoming.filter(e =>
    e.host.id !== me &&
    e.join_requests.some(r => r.user.id === me && r.status === 'pending')
  );

  /* Requests waiting on me as host */
  const needsAction = circle
    .filter(e => e.host.id === me)
    .map(e => ({ event: e, count: e.join_requests.filter(r => r.status === 'pending').length }))
    .filter(x => x.count > 0);
  const totalPending = needsAction.reduce((s, x) => s + x.count, 0);

  /* Hero = most imminent circle event (or first open event if nothing in circle) */
  const hero      = circle[0] ?? atJU[0] ?? null;
  const heroInJU  = hero && !inCircle(hero);
  const shelf     = circle.filter(e => e.id !== hero?.id);   /* remaining circle */

  /* People strip — one host-face per event, circle first then open */
  type PersonNode = { eventId: number; name: string; color: string; url?: string; title: string; when: string; };
  const peopleStrip: PersonNode[] = [
    ...circle.map(e => ({ eventId: e.id, name: e.host.full_name, color: e.host.avatar_color || '#7C3AED', url: e.host.avatar_url, title: e.title, when: e.event_datetime })),
    ...atJU.map(e  => ({ eventId: e.id, name: e.host.full_name, color: e.host.avatar_color || '#7C3AED', url: e.host.avatar_url, title: e.title, when: e.event_datetime })),
  ].filter((p, i, arr) => arr.findIndex(x => x.eventId === p.eventId) === i)
   .filter(p => hero ? p.eventId !== hero.id : true)        /* hero already shown */
   .slice(0, 18);

  return (
    <AppShell>
      {/* ── Top bar ───────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(9,9,26,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
          color: 'var(--text-primary)', letterSpacing: '-0.04em',
        }}>
          together<span style={{ color: 'var(--brand-mid)' }}>.</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/events/new" aria-label="Host" style={{
            width: 36, height: 36, borderRadius: 11, background: 'var(--brand-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', textDecoration: 'none',
          }}>
            <Plus size={18} strokeWidth={2.4} />
          </Link>
          <button onClick={() => setNotifOpen(true)} aria-label="Notifications" style={{
            position: 'relative', width: 36, height: 36, borderRadius: 11,
            border: '0.5px solid var(--border-subtle)', background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
          }}>
            <Bell size={17} strokeWidth={1.75} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          <Link href="/profile" aria-label="Profile" style={{
            width: 36, height: 36, borderRadius: '50%',
            background: user?.avatar_color || 'var(--brand-primary)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, textDecoration: 'none',
            overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.08)',
          }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (user?.full_name?.charAt(0).toUpperCase() || '?')}
          </Link>
        </div>
      </div>

      {/* ── Skeleton ──────────────────────────────────────────── */}
      {loading && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ height: 220, borderRadius: 20 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, flex: 1, borderRadius: 16 }} />)}
          </div>
          <div className="skeleton" style={{ height: 140, borderRadius: 20 }} />
        </div>
      )}

      {/* ── Empty ─────────────────────────────────────────────── */}
      {!loading && !hero && pending.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, padding: '80px 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, background: 'var(--bg-elevated)',
            border: '0.5px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plus size={24} color="var(--brand-mid)" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            nothing here yet
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, maxWidth: 240 }}>
            Host the first event or explore what&apos;s coming up at JU.
          </p>
          <Link href="/events/new" style={{
            padding: '13px 28px', background: 'var(--brand-primary)',
            borderRadius: 'var(--radius-pill)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
          }}>host an event</Link>
        </div>
      )}

      {/* ── Feed ──────────────────────────────────────────────── */}
      {!loading && (hero || pending.length > 0) && (
        <div style={{ paddingBottom: 48 }}>

          {/* ── Action band — requests waiting on me ─────────── */}
          {needsAction.length > 0 && (
            <div style={{ padding: '10px 20px 0' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(251,191,36,0.07)', border: '0.5px solid rgba(251,191,36,0.28)',
                borderRadius: 13, padding: '11px 14px',
              }}>
                <Users size={15} color="#FBBF24" strokeWidth={2} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                  {totalPending} {totalPending === 1 ? 'person wants' : 'people want'} to join your events
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {needsAction.slice(0, 3).map(({ event }) => (
                    <Link key={event.id} href={`/events/${event.id}`} style={{
                      fontSize: 11, fontWeight: 700, color: '#FBBF24',
                      background: 'rgba(251,191,36,0.16)', borderRadius: 999, padding: '3px 8px',
                      textDecoration: 'none', whiteSpace: 'nowrap',
                      maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block',
                    }}>
                      {event.title}
                    </Link>
                  ))}
                </div>
                <ChevronRight size={14} color="rgba(251,191,36,0.6)" style={{ flexShrink: 0 }} />
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────
              THE HERO
              Composition: faces dominate the top. People are the
              headline. Event title sits below them — secondary.
              The card is taller and more atmospheric than anything
              else in the feed. Social distance = nothing else is
              this big.
          ───────────────────────────────────────────────────── */}
          {hero && <HeroCard event={hero} me={me} isOpen={!!heroInJU} />}

          {/* ─────────────────────────────────────────────────────
              PEOPLE STRIP
              A horizontal row of faces — hosts of every upcoming
              event. Circle first, then open. No heading. The faces
              ARE the navigation. Tap a face → their event.
              This is the social graph made visible in the feed.
          ───────────────────────────────────────────────────── */}
          {(peopleStrip.length > 0 || shelf.length > 0 || pending.length > 0) && (
            <PeopleStrip
              nodes={peopleStrip}
              shelf={shelf}
              pending={pending}
              me={me}
            />
          )}

          {/* ─────────────────────────────────────────────────────
              OPEN GRID
              University-wide events in a 2-column grid. Smaller
              density. Same DNA — faces still come first in each
              cell. The grid feels like a city bulletin board: lots
              of options, scan at a glance.
          ───────────────────────────────────────────────────── */}
          {atJU.length > 0 && <OpenGrid events={atJU} heroId={hero?.id} />}

        </div>
      )}

      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
      <OnboardingOverlay />
    </AppShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO CARD
   The most imminent event in the user's world.
   Faces occupy the top half — people are the headline.
   Event details sit below, secondary.
═══════════════════════════════════════════════════════════════ */

function HeroCard({ event, me, isOpen }: { event: Event; me?: number; isOpen: boolean }) {
  const host      = event.host;
  const hostColor = host.avatar_color || '#7C3AED';
  const approved  = event.join_requests?.filter(r => r.status === 'approved') ?? [];
  const count     = approved.length;
  const d         = new Date(event.event_datetime);
  const diffMs    = d.getTime() - Date.now();
  const soon      = diffMs <= 2 * 3_600_000;

  const firstName = (n: string) => n.trim().split(' ')[0];
  const names     = approved.slice(0, 3).map(r => firstName(r.user.full_name));
  const overflow  = count - names.length;

  /* Name-dot sentence */
  const sentence = names.length > 0
    ? names.join(' · ') + (overflow > 0 ? ` · +${overflow}` : '')
    : '';

  const myRequest = event.join_requests?.find(r => r.user?.id === me);
  const isHost    = event.host.id === me;

  const capacity  = event.max_participants;
  const spotsLeft = capacity != null ? (capacity as number) - count : null;
  const isFull    = spotsLeft !== null && spotsLeft <= 0;

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block', padding: '14px 20px 0' }}>
      <div style={{
        borderRadius: 20,
        background: `radial-gradient(160% 130% at 10% 0%, ${hexToRgba(hostColor, 0.22)} 0%, transparent 60%), var(--bg-card)`,
        border: `0.5px solid ${hexToRgba(hostColor, 0.40)}`,
        overflow: 'hidden',
        boxShadow: `0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px ${hexToRgba(hostColor, 0.08)} inset`,
      }}>
        {/* FACES — the headline of this card */}
        <div style={{ padding: '20px 20px 0', position: 'relative' }}>

          {/* countdown chip — top-right, unobtrusive */}
          <div style={{
            position: 'absolute', top: 20, right: 20,
            display: 'flex', alignItems: 'center', gap: 5,
            background: soon ? hexToRgba(hostColor, 0.22) : 'rgba(255,255,255,0.06)',
            border: `0.5px solid ${soon ? hexToRgba(hostColor, 0.4) : 'rgba(255,255,255,0.10)'}`,
            borderRadius: 999, padding: '4px 10px',
          }}>
            {soon && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-go)', display: 'inline-block' }} />
            )}
            <span style={{
              fontSize: 11.5, fontWeight: 700,
              color: soon ? hostColor : 'var(--text-muted)',
            }}>
              {timeUntil(event.event_datetime)}
            </span>
          </div>

          {/* Faces — overlapping cluster */}
          <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 14 }}>
            {/* host — always largest */}
            <div style={{ zIndex: 10, position: 'relative' }}>
              <Avatar name={host.full_name} color={hostColor} url={host.avatar_url}
                    size={58} ringWidth={3} ringColor={hexToRgba(hostColor, 0.90)} />
            </div>
            {approved.slice(0, 4).map((r, i) => (
              <div key={r.id} style={{ marginLeft: -14, zIndex: 9 - i, position: 'relative' }}>
                <Avatar name={r.user.full_name} color={r.user.avatar_color} url={r.user.avatar_url}
                      size={44} ringWidth={2.5} ringColor="var(--bg-card)" />
              </div>
            ))}
            {count > 4 && (
              <div style={{
                width: 40, height: 40, borderRadius: '50%', marginLeft: -12, zIndex: 0,
                background: hexToRgba(hostColor, 0.18), border: `2.5px solid var(--bg-card)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.80)', fontSize: 11, fontWeight: 800,
              }}>+{count - 4}</div>
            )}
            {count === 0 && (
              <div style={{
                width: 44, height: 44, borderRadius: '50%', marginLeft: -12, zIndex: 0,
                background: hexToRgba(hostColor, 0.14),
                border: `2px dashed ${hexToRgba(hostColor, 0.50)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: hexToRgba(hostColor, 0.80), fontSize: 18, fontWeight: 700,
              }}>+</div>
            )}
          </div>

          {/* Name-dot sentence — who's inside */}
          {sentence && (
            <p style={{
              fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
              letterSpacing: '-0.01em', marginBottom: 4, lineHeight: 1.3,
            }}>
              {sentence}
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> going</span>
            </p>
          )}
          {!sentence && (
            <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>
              Be the first to join
            </p>
          )}

          {isOpen && (
            <span style={{
              display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--brand-mid)',
              background: 'rgba(124,58,237,0.12)', borderRadius: 999, padding: '2px 8px', marginBottom: 2,
            }}>open at JU</span>
          )}
        </div>

        {/* EVENT DETAILS — secondary, below the social layer */}
        <div style={{
          padding: '14px 20px 18px',
          borderTop: `0.5px solid ${hexToRgba(hostColor, 0.14)}`,
          marginTop: 14,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
            letterSpacing: '-0.035em', lineHeight: 1.18, color: 'var(--text-primary)',
            marginBottom: 10,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          } as React.CSSProperties}>
            {event.title}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-muted)' }}>
              <Clock size={13} /> {shortTime(event.event_datetime)}
            </span>
            {event.location_text && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-muted)', minWidth: 0 }}>
                <MapPin size={13} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                  {event.location_text}
                </span>
              </span>
            )}

            {/* Status or capacity pill */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {myRequest && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: myRequest.status === 'approved' ? '#34D399' : myRequest.status === 'pending' ? '#FBBF24' : '#FB7185',
                  background: myRequest.status === 'approved' ? 'rgba(52,211,153,0.12)' : myRequest.status === 'pending' ? 'rgba(251,191,36,0.12)' : 'rgba(251,113,133,0.12)',
                  borderRadius: 999, padding: '4px 10px',
                }}>
                  {myRequest.status === 'approved' ? '✓ Joined' : myRequest.status === 'pending' ? 'Pending' : 'Declined'}
                </span>
              )}
              {isHost && (
                <span style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--brand-mid)',
                  background: 'rgba(124,58,237,0.14)', borderRadius: 999, padding: '4px 10px',
                }}>Hosting</span>
              )}
              {!myRequest && !isHost && !isFull && (
                <span style={{
                  fontSize: 11, fontWeight: 700, color: hostColor,
                  background: hexToRgba(hostColor, 0.14), borderRadius: 999, padding: '4px 10px',
                }}>Request</span>
              )}
              {isFull && (
                <span style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: '4px 10px',
                }}>Full</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PEOPLE STRIP
   The social graph made tangible. A horizontal row of faces —
   each face is a host of an event. No section headings.
   The faces ARE the navigation. Circle events come first.
   Strangers at the end = the university expanding into view.
═══════════════════════════════════════════════════════════════ */

type PersonNode = { eventId: number; name: string; color: string; url?: string; title: string; when: string; };

function PeopleStrip({
  nodes, shelf, pending, me,
}: {
  nodes: PersonNode[];
  shelf: Event[];
  pending: Event[];
  me?: number;
}) {
  if (nodes.length === 0 && shelf.length === 0 && pending.length === 0) return null;

  const firstName = (n: string) => n.trim().split(' ')[0];

  return (
    <div style={{ paddingTop: 22 }}>
      {/* Shelf — your other circle events (excluding hero) as compact tiles */}
      {(shelf.length > 0 || pending.length > 0) && (
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none',
          margin: '0 0 0 0', padding: '0 20px 14px',
        } as React.CSSProperties}>
          {shelf.map(e => (
            <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <ShelfTile event={e} me={me} />
            </Link>
          ))}
          {pending.map(e => (
            <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <ShelfTile event={e} me={me} isPending />
            </Link>
          ))}
        </div>
      )}

      {/* Faces row — all upcoming hosts */}
      {nodes.length > 0 && (
        <div style={{
          display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none',
          padding: '4px 20px 6px',
        } as React.CSSProperties}>
          {nodes.map((node, i) => (
            <Link key={node.eventId} href={`/events/${node.eventId}`} style={{
              textDecoration: 'none', flexShrink: 0, width: 76,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '6px 0',
            }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={node.name} color={node.color} url={node.url} size={46} ringWidth={2} ringColor="var(--bg-base)" />
                {/* subtle ring on first (circle) nodes */}
                {i < 3 && (
                  <div style={{
                    position: 'absolute', inset: -3, borderRadius: '50%',
                    border: `1.5px solid ${hexToRgba(node.color, 0.35)}`, pointerEvents: 'none',
                  }} />
                )}
              </div>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {firstName(node.name)}
                </p>
                <p style={{
                  fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  lineHeight: 1.3,
                }}>
                  {node.title}
                </p>
                <p style={{
                  fontSize: 10, color: hexToRgba(node.color, 0.80), fontWeight: 600, marginTop: 2,
                }}>
                  {timeUntil(node.when)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Shelf tile — compact card for circle events ─────────────── */

function ShelfTile({ event, me, isPending }: { event: Event; me?: number; isPending?: boolean }) {
  const hostColor = event.host.avatar_color || '#7C3AED';
  const approved  = event.join_requests?.filter(r => r.status === 'approved').length ?? 0;
  const isHost    = event.host.id === me;

  return (
    <div style={{
      width: 200, padding: '12px 14px',
      background: hexToRgba(hostColor, 0.05),
      border: `0.5px solid ${hexToRgba(hostColor, 0.22)}`,
      borderRadius: 17,
      display: 'flex', flexDirection: 'column', gap: 7,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar name={event.host.full_name} color={hostColor} url={event.host.avatar_url} size={26} ringWidth={1.5} />
          {event.join_requests.filter(r => r.status === 'approved').slice(0, 2).map((r, i) => (
            <div key={r.id} style={{ marginLeft: -8 }}>
              <Avatar name={r.user.full_name} color={r.user.avatar_color} size={22} ringWidth={1.5} />
            </div>
          ))}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: isPending ? '#FBBF24' : isHost ? 'var(--brand-mid)' : '#34D399',
          background: isPending ? 'rgba(251,191,36,0.14)' : isHost ? 'rgba(124,58,237,0.14)' : 'rgba(52,211,153,0.12)',
          borderRadius: 999, padding: '2px 7px',
        }}>
          {isPending ? 'pending' : isHost ? 'hosting' : 'going'}
        </span>
      </div>
      <p style={{
        fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)',
        lineHeight: 1.25,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      } as React.CSSProperties}>
        {event.title}
      </p>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
        {shortTime(event.event_datetime)}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OPEN GRID
   University-wide events in a 2-column grid. More events, less
   real estate per event. Still people-first inside each cell.
   The grid density signals "the wider world" vs the intimate
   hero above. No heading needed — the grid is its own language.
═══════════════════════════════════════════════════════════════ */

function OpenGrid({ events, heroId }: { events: Event[]; heroId?: number }) {
  const visible = events.filter(e => e.id !== heroId);
  if (visible.length === 0) return null;

  const firstName = (n: string) => n.trim().split(' ')[0];

  return (
    <div style={{ padding: '22px 20px 0' }}>
      {/* Dim label — not a section heading, just a very quiet orientation */}
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.20)', marginBottom: 12,
      }}>
        open at JU · {visible.length}
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
      }}>
        {visible.map(event => {
          const host      = event.host;
          const hostColor = host.avatar_color || '#7C3AED';
          const approved  = event.join_requests?.filter(r => r.status === 'approved') ?? [];
          const count     = approved.length;
          const faces     = [host, ...approved.map(r => r.user)].slice(0, 3);
          const namesDot  = approved.slice(0, 2).map(r => firstName(r.user.full_name));
          const overN     = count - namesDot.length;

          return (
            <Link key={event.id} href={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: hexToRgba(hostColor, 0.05),
                border: `0.5px solid ${hexToRgba(hostColor, 0.22)}`,
                borderRadius: 17, padding: '12px 12px 11px',
                display: 'flex', flexDirection: 'column', gap: 8, height: '100%',
              }}>
                {/* Faces */}
                <div style={{ display: 'flex', alignItems: 'center', gap: -4 }}>
                  {faces.map((u, i) => (
                    <div key={i} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 5 - i }}>
                      <Avatar name={u.full_name} color={u.avatar_color} url={u.avatar_url}
                            size={26} ringWidth={1.5} ringColor="var(--bg-card)" />
                    </div>
                  ))}
                  {count > 2 && (
                    <span style={{
                      marginLeft: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                    }}>{count} going</span>
                  )}
                  {count === 0 && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-muted)' }}>be first</span>
                  )}
                </div>

                {/* Names */}
                {namesDot.length > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.3 }}>
                    {namesDot.join(' · ')}{overN > 0 ? ` +${overN}` : ''}
                  </p>
                )}

                {/* Title */}
                <p style={{
                  fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)',
                  lineHeight: 1.25, flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                } as React.CSSProperties}>
                  {event.title}
                </p>

                {/* Time chip */}
                <span style={{
                  display: 'inline-block', fontSize: 10.5, fontWeight: 600,
                  color: hexToRgba(hostColor, 0.85),
                  background: hexToRgba(hostColor, 0.12),
                  borderRadius: 999, padding: '3px 8px', alignSelf: 'flex-start',
                }}>
                  {shortTime(event.event_datetime)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
