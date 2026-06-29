'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventsApi } from '@/lib/api';
import { Event } from '@/lib/types';
import { useAuthStore } from '@/lib/store';
import AppShell from '@/components/layout/AppShell';
import { EventChatDrawer } from '@/components/chat/EventChatDrawer';
import { EventEditDrawer } from '@/components/events/EventEditDrawer';
import { format } from 'date-fns';
import { Check, X, MessageCircle, ArrowLeft, MapPin, Clock, CheckCircle, XCircle, Home, Crown } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { parseApiError } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import { Avatar } from '@/components/ui/Avatar';

export default function EventDetailPage() {
  const { id }        = useParams();
  const router        = useRouter();
  const { user }      = useAuthStore();
  const searchParams  = useSearchParams();

  const [event,         setEvent]         = useState<Event | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [chatOpen,      setChatOpen]      = useState(searchParams.get('chat') === '1');
  const [editOpen,      setEditOpen]      = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showCreatedBanner, setShowCreatedBanner] = useState(searchParams.get('created') === '1');

  const fetchEvent = async () => {
    try {
      const res: any = await eventsApi.get(Number(id));
      setEvent(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvent(); }, [id]);

  const handleJoin = async () => {
    if (!event) return;
    setActionLoading(true);
    try {
      await eventsApi.requestJoin(event.id);
      fetchEvent();
    } catch (err: any) {
      showToast(parseApiError(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequest = async (requestId: number, action: 'approve' | 'reject') => {
    if (!event) return;
    setActionLoading(true);
    try {
      await eventsApi.handleRequest(event.id, requestId, action);
      fetchEvent();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    await eventsApi.delete(event.id);
    router.replace('/events');
  };

  /* ── Loading ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 14 }} />
          </div>
          {[180, 100, 80].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell>
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Event not found.</p>
          <Link href="/discover" style={{
            display: 'inline-block', marginTop: 16,
            color: 'var(--brand-primary)', fontWeight: 700, fontSize: 14,
          }}>
            Back to Discover
          </Link>
        </div>
      </AppShell>
    );
  }

  const isHost          = user?.id === event.host.id;
  const userRequest     = event.join_requests.find(r => r.user.id === user?.id);
  const pendingRequests = event.join_requests.filter(r => r.status === 'pending');
  const approvedReqs    = event.join_requests.filter(r => r.status === 'approved');

  const hasCapacity = event.max_participants !== null && event.max_participants !== undefined;
  const spotsLeft   = hasCapacity ? (event.max_participants as number) - event.approved_count : null;
  const isFull       = hasCapacity ? (spotsLeft as number) <= 0 : false;

  const mapsUrl = event.latitude !== null && event.longitude !== null
    ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
    : event.location_text
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location_text)}`
    : null;

  const dt              = new Date(event.event_datetime);
  const canChat         = isHost || userRequest?.status === 'approved';

  const diffH    = (dt.getTime() - Date.now()) / 3_600_000;
  const isToday  = dt.toDateString() === new Date().toDateString();
  const isSoon   = diffH > 0 && diffH <= 3;
  const timeTag  = isSoon ? 'Starting soon' : isToday ? 'Happening today' : null;

  return (
    <AppShell>
      {/* ── Top bar ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 6px',
      }}>
        <button onClick={() => { if (window.history.length > 1) router.back(); else router.push('/events'); }}
          aria-label="Back" style={{
          width: 40, height: 40, borderRadius: 14, background: 'var(--bg-elevated)',
          border: '0.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'var(--text-primary)', flexShrink: 0, cursor: 'pointer',
        }}>
          <ArrowLeft size={18} />
        </button>
        {isHost && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setEditOpen(true)} style={{
              fontSize: 13, fontWeight: 700, color: 'var(--brand-mid)', background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.22)', borderRadius: 11, padding: '7px 14px', cursor: 'pointer',
            }}>Edit</button>
            <button onClick={handleDelete} style={{
              fontSize: 13, fontWeight: 700,
              color: deleteConfirm ? '#FB7185' : 'var(--text-muted)',
              background: deleteConfirm ? 'rgba(251,113,133,0.10)' : 'transparent',
              border: deleteConfirm ? '1px solid rgba(251,113,133,0.24)' : '1px solid transparent',
              borderRadius: 11, padding: '7px 14px', cursor: 'pointer',
            }}>{deleteConfirm ? 'Confirm delete?' : 'Delete'}</button>
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div style={{ padding: '10px 20px 32px' }}>

        {showCreatedBanner && (
          <div style={{
            background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.22)',
            borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 18,
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <CheckCircle size={18} strokeWidth={1.75} color="#34D399" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#34D399', marginBottom: 3 }}>Event created</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Students can now request to join. You'll be notified when someone does.
              </p>
            </div>
            <button onClick={() => setShowCreatedBanner(false)} aria-label="Dismiss" style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              fontSize: 16, lineHeight: 1, flexShrink: 0, padding: 2,
            }}>×</button>
          </div>
        )}

        {timeTag && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 10,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: isSoon ? 'var(--accent-live)' : 'var(--accent-go)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: isSoon ? 'var(--accent-live)' : 'var(--accent-go)', animation: 'livePulse 1.6s ease-in-out infinite' }} />
            {timeTag}
          </span>
        )}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.035em',
          lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 18,
        }}>
          {event.title}
        </h1>

        {/* ── People (host + who's going) ───────────────────────── */}
        <section style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: approvedReqs.length > 0 ? 18 : 0 }}>
            <Avatar name={event.host.full_name} color={event.host.avatar_color} url={event.host.avatar_url} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Hosted by</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 1 }}>
                {event.host.full_name}{isHost ? ' · you' : ''}
              </p>
            </div>
          </div>

          {approvedReqs.length > 0 ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex' }}>
                  {approvedReqs.slice(0, 6).map((req, i) => (
                    <div key={req.id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 6 - i }}>
                      <Avatar name={req.user.full_name} color={req.user.avatar_color} url={req.user.avatar_url}
                        size={34} ringWidth={2} />
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {approvedReqs.length} going
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                {approvedReqs.slice(0, 3).map(r => r.user.full_name.split(' ')[0]).join(' · ')}
                {approvedReqs.length > 3 && (
                  <span style={{ color: 'var(--text-muted)' }}> · and {approvedReqs.length - 3} more JU students</span>
                )}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {isHost ? 'No one has joined yet — approve requests to fill it up.' : 'No one has joined yet. Be the first.'}
            </p>
          )}
        </section>

        {/* ── When / where ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
            <Clock size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            {format(dt, 'EEEE d MMMM · HH:mm')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
            <MapPin size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.location_text}
            </span>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps" style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
                color: 'var(--brand-mid)', fontSize: 12, fontWeight: 700, textDecoration: 'none',
                padding: '6px 8px', margin: '-6px -2px -6px 0',
              }}>
                <MapPin size={12} strokeWidth={2} /> Maps
              </a>
            )}
          </div>
        </div>

        {/* ── PRIMARY: your status / action ─────────────────────── */}
        {isHost ? (
          <div style={{ marginBottom: 26 }}>
            <StatusBlock
              tone="brand"
              icon={<Crown size={18} strokeWidth={1.9} />}
              title="You're hosting"
              subtitle={pendingRequests.length > 0
                ? `${pendingRequests.length} ${pendingRequests.length === 1 ? 'request needs' : 'requests need'} your review`
                : 'Manage this event and its chat'}
            />
            <button onClick={() => setChatOpen(true)} className="btn btn-primary btn-block"
              style={{ marginTop: 12, borderRadius: 'var(--radius-lg)' }}>
              <MessageCircle size={18} /> Open event chat
            </button>
          </div>
        ) : !userRequest ? (
          <div style={{ marginBottom: 26 }}>
            <button
              onClick={handleJoin}
              disabled={actionLoading || isFull}
              className="btn btn-primary btn-block btn-lg"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              {isFull ? 'Event full' : actionLoading ? 'Sending…' : 'Request to join'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
              The host reviews every request before you get access.
            </p>
          </div>
        ) : userRequest.status === 'approved' ? (
          <div style={{ marginBottom: 26 }}>
            <StatusBlock tone="success" icon={<CheckCircle size={18} strokeWidth={1.9} />}
              title="You're going" subtitle="You have access to this event and its chat." />
            <button onClick={() => setChatOpen(true)} className="btn btn-primary btn-block"
              style={{ marginTop: 12, borderRadius: 'var(--radius-lg)' }}>
              <MessageCircle size={18} /> Open event chat
            </button>
          </div>
        ) : userRequest.status === 'pending' ? (
          <div style={{ marginBottom: 26 }}>
            <StatusBlock tone="warning" icon={<Clock size={18} strokeWidth={1.9} />}
              title="Awaiting approval"
              subtitle={`${event.host.full_name.split(' ')[0]} will approve or decline your request — you'll be notified.`} />
          </div>
        ) : (
          <div style={{ marginBottom: 26 }}>
            <StatusBlock tone="error" icon={<XCircle size={18} strokeWidth={1.9} />}
              title="Request declined" subtitle="This event isn't open to you right now." />
          </div>
        )}

        {/* ── HOST: pending approvals (surfaced near the top) ───── */}
        {isHost && pendingRequests.length > 0 && (
          <section style={{ marginBottom: 26 }}>
            <SectionLabel>Requests to review · {pendingRequests.length}</SectionLabel>
            <div style={{
              border: '0.5px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}>
              {pendingRequests.map((req, i) => (
                <div key={req.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderTop: i === 0 ? 'none' : '0.5px solid var(--border-subtle)',
                }}>
                  <Avatar name={req.user.full_name} color={req.user.avatar_color} url={req.user.avatar_url} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{req.user.full_name}</p>
                    <p style={{
                      fontSize: 12, color: 'var(--text-muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{req.user.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <IconButton onClick={() => handleRequest(req.id, 'approve')} disabled={actionLoading}
                      bg="rgba(52,211,153,0.15)" border="rgba(52,211,153,0.25)" color="#34D399">
                      <Check size={15} />
                    </IconButton>
                    <IconButton onClick={() => handleRequest(req.id, 'reject')} disabled={actionLoading}
                      bg="rgba(251,113,133,0.1)" border="rgba(251,113,133,0.2)" color="#FB7185">
                      <X size={15} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── About ─────────────────────────────────────────────── */}
        {event.description && (
          <section style={{ marginBottom: 26 }}>
            <SectionLabel>About</SectionLabel>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              {event.description}
            </p>
          </section>
        )}

        {/* ── Accommodation ─────────────────────────────────────── */}
        {event.accommodation && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.22)',
            color: 'var(--brand-mid)', fontSize: 12, fontWeight: 700,
            padding: '6px 14px', borderRadius: 'var(--radius-pill)',
          }}>
            <Home size={13} strokeWidth={2} />
            {event.accommodation}{event.floor ? ` · Floor ${event.floor}` : ''}
          </div>
        )}
      </div>

      {/* ── Chat drawer ───────────────────────────────────────────── */}
      {canChat && (
        <EventChatDrawer
          isOpen={chatOpen}
          eventId={event.id}
          eventTitle={event.title}
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* ── Edit drawer ───────────────────────────────────────────── */}
      {isHost && (
        <EventEditDrawer
          event={event}
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={(updated) => setEvent(updated)}
        />
      )}
    </AppShell>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize:      11,
      fontWeight:    700,
      color:         'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom:  12,
      fontFamily:    'var(--font-display)',
    }}>
      {children}
    </p>
  );
}

function IconButton({
  onClick, disabled, bg, border, color, children,
}: {
  onClick: () => void; disabled: boolean;
  bg: string; border: string; color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width:          36,
        height:         36,
        borderRadius:   12,
        background:     bg,
        border:         `1px solid ${border}`,
        color,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        transition:     'opacity 0.15s ease',
        opacity:        disabled ? 0.5 : 1,
        flexShrink:     0,
      }}
    >
      {children}
    </button>
  );
}

function StatusBlock({
  tone, icon, title, subtitle,
}: {
  tone: 'brand' | 'success' | 'warning' | 'error';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const tones = {
    brand:   { bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.24)', color: 'var(--brand-mid)' },
    success: { bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.22)',  color: '#34D399' },
    warning: { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)', color: '#FBBF24' },
    error:   { bg: 'rgba(251,113,133,0.10)',  border: 'rgba(251,113,133,0.22)',  color: '#FB7185' },
  }[tone];

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '16px', borderRadius: 'var(--radius-lg)',
      background: tones.bg, border: `0.5px solid ${tones.border}`,
    }}>
      <span style={{ color: tones.color, flexShrink: 0, marginTop: 1, display: 'flex' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: tones.color }}>{title}</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.5 }}>{subtitle}</p>
      </div>
    </div>
  );
}
