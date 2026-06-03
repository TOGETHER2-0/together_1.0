'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { eventsApi } from '@/lib/api';
import { getCategoryMeta } from '@/lib/utils';
import Link from 'next/link';

interface ChatPreview {
  eventId:     number;
  eventTitle:  string;
  location:    string;
  lastMessage: string | null;
  lastSender:  string | null;
  lastAt:      string | null;
}

export default function ChatHubPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [chats,   setChats]   = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        // Prende tutti gli eventi — filtra quelli a cui sei iscritto
        const events: any[] = await eventsApi.list() as any;
        const approved = events.filter(ev =>
          ev.join_requests?.some(
            (r: any) => r.user?.id === user?.id && r.status === 'approved'
          ) || ev.host?.id === user?.id  // include anche eventi che hai creato tu
        );

        // Per ogni evento, prende l'ultimo messaggio
        const previews = await Promise.all(
          approved.map(async (ev) => {
            try {
              const msgs: any[] = await eventsApi.getMessages(ev.id) as any;
              const last = Array.isArray(msgs) && msgs.length > 0
                ? msgs[msgs.length - 1]
                : null;
              return {
                eventId:     ev.id,
                eventTitle:  ev.title,
                location:    ev.location_text ?? '',
                lastMessage: last?.text ?? null,
                lastSender:  last?.user?.full_name ?? null,
                lastAt:      last?.created_at ?? null,
              };
            } catch {
              return {
                eventId:    ev.id,
                eventTitle: ev.title,
                location:   ev.location_text ?? '',
                lastMessage: null, lastSender: null, lastAt: null,
              };
            }
          })
        );

        // Ordina: chi ha messaggi recenti prima
        previews.sort((a, b) => {
          if (!a.lastAt && !b.lastAt) return 0;
          if (!a.lastAt) return 1;
          if (!b.lastAt) return -1;
          return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
        });

        setChats(previews);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, user?.id]);

  function formatTime(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    const diffMs   = Date.now() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7)  return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)' }}>

      {/* Header */}
      <div style={{
        padding: '56px 20px 16px',
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.03em',
        }}>
          Chats
        </h1>
      </div>

      {/* Contenuto */}
      <div style={{ paddingBottom: 100 }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
            <div style={{
              width: 28, height: 28,
              border: '2.5px solid rgba(255,255,255,0.08)',
              borderTopColor: '#7C5CFC',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Errore */}
        {!loading && error && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#FF5E7D' }}>
            <p style={{ fontSize: 14 }}>Failed to load chats. Please try again.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && chats.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '80px 32px', gap: 12, textAlign: 'center',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 24,
              background: 'rgba(124,92,252,0.1)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 32, marginBottom: 4,
            }}>💬</div>
            <p style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
              No chats yet
            </p>
            <p style={{
              color: 'var(--text-secondary)', fontSize: 14,
              lineHeight: 1.6, maxWidth: 240,
            }}>
              Join an event to start chatting with other attendees
            </p>
            <Link href="/events" style={{
              marginTop: 12,
              background: 'linear-gradient(135deg, #7C5CFC, #FF5E7D)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              padding: '13px 28px', borderRadius: 16,
              textDecoration: 'none', display: 'inline-block',
            }}>
              Explore events →
            </Link>
          </div>
        )}

        {/* Lista chat */}
        {chats.map((chat) => {
          const meta = getCategoryMeta(chat.location);
          const isOwn = chat.lastSender === user?.full_name;

          return (
            <Link
              key={chat.eventId}
              href={`/events/${chat.eventId}?chat=1`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background 0.15s',
                }}
                onTouchStart={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onTouchEnd={e   => (e.currentTarget.style.background = 'transparent')}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Icona evento colorata per categoria */}
                <div style={{
                  width: 50, height: 50,
                  borderRadius: 17, flexShrink: 0,
                  background: meta.dim,
                  border: `1.5px solid ${meta.border}`,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22,
                }}>
                  {meta.icon}
                </div>

                {/* Testo */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 3,
                  }}>
                    <span style={{
                      fontWeight: 700, fontSize: 15,
                      letterSpacing: '-0.01em',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', maxWidth: '65%',
                    }}>
                      {chat.eventTitle}
                    </span>
                    <span style={{
                      fontSize: 12, color: 'var(--text-muted)',
                      flexShrink: 0, marginLeft: 8,
                    }}>
                      {formatTime(chat.lastAt)}
                    </span>
                  </div>

                  <span style={{
                    fontSize: 13.5, color: 'var(--text-secondary)',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', display: 'block',
                  }}>
                    {chat.lastMessage
                      ? `${isOwn ? 'You' : chat.lastSender}: ${chat.lastMessage}`
                      : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No messages yet
                        </span>
                    }
                  </span>
                </div>

                {/* Freccia */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                  <path d="M9 18L15 12L9 6" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}