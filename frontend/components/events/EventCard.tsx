'use client';

import Link from 'next/link';
import { Event } from '@/lib/types';
import { getFacultyColor, getFacultyColorDim, getFacultyColorBorder, getFacultyShort } from '@/lib/faculties';
import { getCategoryMeta, formatEventTime, getInitials } from '@/lib/utils';

interface Props {
  event: Event;
  style?: React.CSSProperties;
}

export default function EventCard({ event, style }: Props) {
  const date   = new Date(event.event_datetime);
  const isPast = date < new Date();

  const faculty     = event.host?.faculty;
  const color       = getFacultyColor(faculty);
  const colorDim    = getFacultyColorDim(faculty);
  const colorBorder = getFacultyColorBorder(faculty);
  const catMeta     = getCategoryMeta(event.location_text);

  const approved  = event.join_requests?.filter(r => r.status === 'approved').length ?? 0;
  const capacity  = event.max_participants;
  const fillPct   = capacity ? Math.min((approved / capacity) * 100, 100) : 0;
  const isFull    = fillPct >= 100;
  const spotsLeft = capacity ? capacity - approved : null;

  const myRequest = event.my_join_request;
  const statusBadge = myRequest
    ? myRequest.status === 'approved'
      ? { label: 'Joined ✓', color: '#00E5B3', bg: 'rgba(0,229,179,0.12)',  border: 'rgba(0,229,179,0.25)' }
      : myRequest.status === 'pending'
      ? { label: 'Pending',  color: '#FFB547',  bg: 'rgba(255,181,71,0.12)', border: 'rgba(255,181,71,0.25)' }
      : { label: 'Declined', color: '#FF5E7D',  bg: 'rgba(255,94,125,0.12)', border: 'rgba(255,94,125,0.25)' }
    : null;

  const weekday  = date.toLocaleString('en', { weekday: 'short' }).toUpperCase();
  const monthStr = date.toLocaleString('en', { month: 'short' }).toUpperCase();

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block', ...style }}>
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 22,
          overflow: 'hidden',
          opacity: isPast ? 0.6 : 1,
          transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = colorBorder;
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Faculty accent bar */}
        <div style={{ height: 2.5, background: `linear-gradient(90deg, ${color}, ${color}40)` }} />

        <div style={{ padding: '16px 18px 14px' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

            {/* Date column */}
            <div style={{
              width: 52, minWidth: 52,
              background: colorDim,
              border: `1px solid ${colorBorder}`,
              borderRadius: 14,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 4px 8px',
              gap: 1,
            }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', color, fontFamily: 'var(--font-display)' }}>
                {weekday}
              </span>
              <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}>
                {date.getDate()}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color, fontFamily: 'var(--font-display)' }}>
                {monthStr}
              </span>
              <div style={{ marginTop: 5, padding: '2px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: 999 }}>
                <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {formatEventTime(event.event_datetime)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 7 }}>
                <h3 style={{
                  fontSize: 15.5, fontWeight: 700,
                  color: 'var(--text-primary)', lineHeight: 1.3,
                  fontFamily: 'var(--font-display)', letterSpacing: '-0.025em',
                  flex: 1, overflow: 'hidden',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {event.title}
                </h3>
                {statusBadge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: statusBadge.color, background: statusBadge.bg,
                    border: `1px solid ${statusBadge.border}`,
                    borderRadius: 999, padding: '3px 9px',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>
                    {statusBadge.label}
                  </span>
                )}
              </div>

              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 9 }}>
                <span>{catMeta.icon}</span>
                <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontWeight: 500 }}>
                  {event.location_text}
                </span>
              </div>

              {/* Host row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: color,
                    color: faculty === 'JTH' || faculty === 'Hälso' ? '#0A0A14' : '#fff',
                    fontSize: 9, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {getInitials(event.host?.full_name).charAt(0)}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {event.host?.full_name?.split(' ')[0] || 'Unknown'}
                  </span>
                  {faculty && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, color,
                      background: colorDim, border: `1px solid ${colorBorder}`,
                      borderRadius: 999, padding: '2px 7px',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {getFacultyShort(faculty)}
                    </span>
                  )}
                </div>

                {capacity && !isFull && spotsLeft !== null && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#00E5B3', background: 'rgba(0,229,179,0.10)', border: '1px solid rgba(0,229,179,0.22)', borderRadius: 999, padding: '2px 9px' }}>
                    {spotsLeft} left
                  </span>
                )}
                {capacity && isFull && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#FF5E7D', background: 'rgba(255,94,125,0.10)', border: '1px solid rgba(255,94,125,0.22)', borderRadius: 999, padding: '2px 9px' }}>
                    Full
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Capacity bar */}
          {capacity && (
            <div style={{ marginTop: 14 }}>
              <div className="progress-track">
                <div className="progress-fill" style={{
                  width: `${fillPct}%`,
                  background: isFull
                    ? 'linear-gradient(90deg, #FF3357, #FF5E7D)'
                    : `linear-gradient(90deg, ${color}, ${color}99)`,
                }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
