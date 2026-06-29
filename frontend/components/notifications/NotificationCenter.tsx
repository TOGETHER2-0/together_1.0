'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, X, UserCheck, UserX, Users, Clock } from 'lucide-react';
import { useNotificationStore, type AppNotification, type NotificationType } from '@/lib/notifications';

/* ─── Icon per type ──────────────────────────────────────────── */

function NotifIcon({ type }: { type: NotificationType }) {
  const configs = {
    join_request:     { Icon: Users,     bg: 'rgba(124,58,237,0.13)', color: 'var(--brand-primary)' },
    request_accepted: { Icon: UserCheck, bg: 'rgba(52,211,153,0.12)',  color: '#34D399' },
    request_rejected: { Icon: UserX,     bg: 'rgba(251,113,133,0.10)',  color: '#FB7185' },
    starting_soon:    { Icon: Clock,     bg: 'rgba(251,191,36,0.12)', color: '#FBBF24' },
  } as const;
  const { Icon, bg, color } = configs[type];
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 13, flexShrink: 0,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={18} color={color} strokeWidth={1.75} />
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─── Notification row ───────────────────────────────────────── */

function NotifRow({ n, onClose }: { n: AppNotification; onClose: () => void }) {
  const { markRead } = useNotificationStore();
  return (
    <Link
      href={`/events/${n.eventId}`}
      onClick={() => { markRead(n.id); onClose(); }}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 20px',
          // Unread rows get a left accent bar + subtle tint
          background: n.read ? 'transparent' : 'rgba(124,58,237,0.05)',
          borderLeft: n.read ? '3px solid transparent' : '3px solid var(--brand-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'background 0.15s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.background = n.read ? 'transparent' : 'rgba(124,58,237,0.05)';
        }}
      >
        <NotifIcon type={n.type} />

        <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
          {/* Title */}
          <p style={{
            fontSize: 13.5, fontWeight: n.read ? 500 : 700,
            color: 'var(--text-primary)', margin: 0,
            lineHeight: 1.3, letterSpacing: '-0.01em',
          }}>
            {n.title}
          </p>
          {/* Body */}
          <p style={{
            fontSize: 12.5,
            color: 'var(--text-secondary)',
            margin: '3px 0 0', lineHeight: 1.45,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          } as React.CSSProperties}>
            {n.body}
          </p>
          {/* Timestamp */}
          <p style={{
            fontSize: 11, color: 'var(--text-muted)',
            margin: '5px 0 0', fontWeight: 500,
            letterSpacing: '0.01em',
          }}>
            {timeAgo(n.createdAt)}
          </p>
        </div>

        {/* Unread dot */}
        {!n.read && (
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--brand-primary)',
            flexShrink: 0, marginTop: 5,
          }} />
        )}
      </div>
    </Link>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ open, onClose }: Props) {
  const { notifications, unreadCount, markAllRead } = useNotificationStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else      document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.55)',
          animation: 'fadeIn 0.2s ease both',
        }}
      />

      {/* Sheet — centered via margin auto so the slideUp transform animation
          (which only sets translateY) never overrides horizontal centering */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        margin: '0 auto',
        width: '100%', maxWidth: 430,
        zIndex: 201,
        background: 'var(--bg-surface)',
        borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border-medium)',
        borderBottom: 'none',
        boxShadow: 'var(--shadow-sheet)',
        maxHeight: '76dvh',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.32s cubic-bezier(0.32, 0.72, 0, 1) both',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{
            width: 32, height: 3.5, borderRadius: 2,
            background: 'rgba(255,255,255,0.14)',
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px 12px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={17} strokeWidth={1.75} color="var(--brand-primary)" />
            <span style={{
              fontSize: 16, fontWeight: 700,
              color: 'var(--text-primary)', letterSpacing: '-0.025em',
            }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span style={{
                fontSize: 10.5, fontWeight: 700, color: '#fff',
                background: 'var(--brand-primary)',
                borderRadius: 999, padding: '2px 7px',
                lineHeight: 1.5, letterSpacing: '0.01em',
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12.5, fontWeight: 600,
                  color: 'var(--brand-primary)',
                  fontFamily: 'var(--font-body)',
                  padding: '6px 8px',
                  borderRadius: 8,
                  transition: 'background 0.14s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)',
                transition: 'background 0.14s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
            >
              <X size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '64px 24px', gap: 12, textAlign: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18,
                background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}>
                <Bell size={22} strokeWidth={1.75} color="var(--text-muted)" />
              </div>
              <div>
                <p style={{
                  fontSize: 15, fontWeight: 700,
                  color: 'var(--text-secondary)', margin: '0 0 6px',
                  letterSpacing: '-0.01em',
                }}>
                  All caught up
                </p>
                <p style={{
                  fontSize: 13, color: 'var(--text-muted)',
                  margin: 0, maxWidth: 220, lineHeight: 1.55,
                }}>
                  Join requests and event updates will appear here
                </p>
              </div>
            </div>
          ) : (
            notifications.map(n => (
              <NotifRow key={n.id} n={n} onClose={onClose} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
