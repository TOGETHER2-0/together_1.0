'use client';

import Link from 'next/link';
import { MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Event } from '@/lib/types';
import { eventWhen, hexToRgba } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
  event: Event;
  style?: React.CSSProperties;
}

/* Build a Google Maps link — exact pin when we have coords, else a text search. */
function mapsUrl(e: Event): string {
  if (e.latitude != null && e.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${e.latitude},${e.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location_text || '')}`;
}

export default function EventCard({ event, style }: Props) {
  const { user } = useAuthStore();
  const date      = new Date(event.event_datetime);
  const isPast    = date < new Date();
  const host      = event.host;
  const hostColor = host.avatar_color || '#7C3AED';

  const approvedReqs = event.join_requests?.filter(r => r.status === 'approved') ?? [];
  const approved     = approvedReqs.length;
  const capacity     = event.max_participants;
  const hasCapacity  = capacity !== null && capacity !== undefined;
  const spotsLeft    = hasCapacity ? (capacity as number) - approved : null;
  const isFull       = hasCapacity && (spotsLeft as number) <= 0;
  const fillingUp    = hasCapacity && !isFull && (approved / (capacity as number)) >= 0.65;

  const firstName = (n: string) => n.trim().split(' ')[0];

  /* ── The signature: the name-dot sentence. Up to three real first names,
     separated by centered dots, then a dim "+N going" tail. This specific
     pattern is Together's fingerprint — who's inside, before you knock. ── */
  const namesShown = approvedReqs.slice(0, 3).map(r => firstName(r.user.full_name));
  const overflowN  = approved - namesShown.length;

  const myRequest = event.join_requests?.find(r => r.user?.id === user?.id);
  const statusBadge = myRequest
    ? myRequest.status === 'approved'
      ? { label: 'Joined',   Icon: CheckCircle, color: '#34D399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.24)' }
      : myRequest.status === 'pending'
      ? { label: 'Pending',  Icon: Clock,       color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.24)' }
      : { label: 'Declined', Icon: XCircle,     color: '#FB7185', bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.24)' }
    : null;

  const nowMs   = Date.now();
  const diffH   = (date.getTime() - nowMs) / 3_600_000;
  const isToday = date.toDateString() === new Date().toDateString();
  const isSoon  = diffH > 0 && diffH <= 3;
  const timeTag = isSoon ? 'Soon' : isToday ? 'Today' : null;

  const whenStr = eventWhen(event.event_datetime);

  // visible avatar faces in the social header (max 3 + overflow chip)
  const faces = approvedReqs.slice(0, 3);

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block', ...style }}>
      <div
        style={{
          background: `${hexToRgba(hostColor, 0.05)}`,
          border: `0.5px solid ${hexToRgba(hostColor, 0.22)}`,
          borderRadius: 17,
          padding: 14,
          opacity: isPast ? 0.55 : 1,
          transition: 'border-color 0.18s ease, background 0.18s ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = hexToRgba(hostColor, 0.40);
          el.style.background = hexToRgba(hostColor, 0.08);
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = hexToRgba(hostColor, 0.22);
          el.style.background = hexToRgba(hostColor, 0.05);
        }}
      >
        {/* ── 1. SOCIAL HEADER — always first. Faces + the name-dot sentence. ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {approved > 0 ? (
              <>
                {faces.map((req, i) => (
                  <div key={req.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 5 - i }}>
                    <Avatar name={req.user.full_name} color={req.user.avatar_color} url={req.user.avatar_url} size={28} ringWidth={1.5} />
                  </div>
                ))}
                {overflowN > 0 && (
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', marginLeft: -7,
                    background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: 700, zIndex: 0,
                  }}>+{overflowN}</div>
                )}
              </>
            ) : (
              <Avatar name={host.full_name} color={hostColor} url={host.avatar_url} size={28} ringWidth={1.5} />
            )}
          </div>

          <span style={{
            fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.80)', lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
          }}>
            {approved > 0 ? (
              <>
                {namesShown.join(' · ')}
                <span style={{ color: 'rgba(255,255,255,0.34)' }}>
                  {overflowN > 0 ? ` +${overflowN} going` : ' going'}
                </span>
              </>
            ) : (
              <>
                {firstName(host.full_name)}
                <span style={{ color: 'rgba(255,255,255,0.34)' }}> · be the first to join</span>
              </>
            )}
          </span>
        </div>

        {/* ── 2. TITLE ──────────────────────────────────────────── */}
        <h3 style={{
          fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.22,
          fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: '0 0 9px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        } as React.CSSProperties}>
          {event.title}
        </h3>

        {/* ── 3. FOOTER — time · location + Maps, balanced with join state ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, flex: 1 }}>
            <Clock size={11} strokeWidth={1.9} style={{ color: 'rgba(255,255,255,0.30)', flexShrink: 0 }} />
            <span style={{
              fontSize: 11, color: 'rgba(255,255,255,0.34)', fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {whenStr}{timeTag ? ` · ${timeTag}` : ''} · {event.location_text}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(mapsUrl(event), '_blank', 'noopener'); }}
              aria-label="Open in Google Maps"
              style={{
                display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px 3px 5px',
                borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent',
                fontFamily: 'inherit', fontSize: 10, fontWeight: 600, letterSpacing: '0.02em',
                color: hexToRgba(hostColor, 0.95), flexShrink: 0,
              }}
            >
              <MapPin size={11} strokeWidth={2} />Maps
            </button>
          </div>

          {statusBadge ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
              color: statusBadge.color, background: statusBadge.bg, border: `1px solid ${statusBadge.border}`,
              borderRadius: 999, padding: '4px 10px', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              <statusBadge.Icon size={10} strokeWidth={2} />
              {statusBadge.label}
            </span>
          ) : isFull ? (
            <Pill color="#FB7185" bg="rgba(251,113,133,0.10)" border="rgba(251,113,133,0.20)">Full</Pill>
          ) : fillingUp ? (
            <Pill color="#FBBF24" bg="rgba(251,191,36,0.12)" border="rgba(251,191,36,0.24)">{spotsLeft} left</Pill>
          ) : (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 999,
              color: '#fff', background: hostColor, whiteSpace: 'nowrap', flexShrink: 0,
              letterSpacing: '0.02em',
            }}>Join →</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Pieces ─────────────────────────────────────────────────── */

function Pill({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color, background: bg, border: `1px solid ${border}`,
      borderRadius: 999, padding: '4px 10px', lineHeight: 1.4, whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {children}
    </span>
  );
}
