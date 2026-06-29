'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { eventsApi } from '@/lib/api';
import { MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';

interface ChatMember { name: string; color: string; url?: string; }

interface ChatPreview {
  eventId:     number;
  eventTitle:  string;
  when:        string;
  lastMessage: string | null;
  lastSender:  string | null;
  lastAt:      string | null;
  isHost:      boolean;
  members:     ChatMember[];
  memberCount: number;
}

export default function ChatHubPage() {
  const { token, user } = useAuthStore();
  const [chats,   setChats]   = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        const events: any[] = await eventsApi.list() as any;
        const mine = events.filter(ev =>
          ev.host?.id === user?.id ||
          ev.join_requests?.some((r: any) => r.user?.id === user?.id && r.status === 'approved')
        );

        const previews = await Promise.all(
          mine.map(async (ev) => {
            let last: any = null;
            try {
              const msgs: any[] = await eventsApi.getMessages(ev.id) as any;
              last = Array.isArray(msgs) && msgs.length > 0 ? msgs[msgs.length - 1] : null;
            } catch { /* keep null */ }

            // host leads the cluster, then approved members — the people in the room
            const approved = (ev.join_requests ?? [])
              .filter((r: any) => r.status === 'approved')
              .map((r: any) => r.user);
            const roster = [ev.host, ...approved].filter(Boolean);
            const members: ChatMember[] = roster.slice(0, 3).map((u: any) => ({
              name: u.full_name, color: u.avatar_color, url: u.avatar_url,
            }));

            return {
              eventId:     ev.id,
              eventTitle:  ev.title,
              when:        ev.event_datetime,
              lastMessage: last?.text ?? null,
              lastSender:  last?.user?.full_name ?? null,
              lastAt:      last?.created_at ?? null,
              isHost:      ev.host?.id === user?.id,
              members,
              memberCount: roster.length,
            } as ChatPreview;
          })
        );

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
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7)  return d.toLocaleDateString('en', { weekday: 'short' });
    return d.toLocaleDateString('en', { day: '2-digit', month: '2-digit' });
  }

  const hosting = chats.filter(c => c.isHost);
  const joined  = chats.filter(c => !c.isHost);

  return (
    <AppShell>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        padding: '20px 20px 16px', position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--text-primary)',
        }}>
          chats
        </h1>
      </div>

      <div style={{ padding: '8px 0 28px' }}>

        {loading && (
          <div style={{ padding: '8px 0' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px' }}>
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 14, width: `${60 + Math.random() * 30}%`, borderRadius: 7 }} />
                  <div className="skeleton" style={{ height: 12, width: `${40 + Math.random() * 30}%`, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div style={{
            margin: '32px 20px', padding: '20px', borderRadius: 18,
            background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)',
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <AlertCircle size={24} strokeWidth={1.75} color="var(--text-muted)" />
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Failed to load chats</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Check your connection and try again</p>
          </div>
        )}

        {!loading && !error && chats.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '72px 32px', gap: 14, textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
            }}>
              <MessageSquare size={24} strokeWidth={1.75} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              No event chats yet
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, maxWidth: 250 }}>
              When you host or get approved for an event, its coordination chat appears here.
            </p>
            <Link href="/discover" style={{
              marginTop: 8, background: 'var(--brand-primary)', color: '#fff', fontWeight: 700, fontSize: 14,
              padding: '14px 28px', borderRadius: 18, textDecoration: 'none', display: 'inline-block',
            }}>
              Browse events
            </Link>
          </div>
        )}

        {!loading && !error && chats.length > 0 && (
          <>
            <ChatGroup title="Hosting" chats={hosting} formatTime={formatTime} userName={user?.full_name} />
            <ChatGroup title="Joined"  chats={joined}  formatTime={formatTime} userName={user?.full_name} />
          </>
        )}
      </div>
    </AppShell>
  );
}

/* ─── Role group ─────────────────────────────────────────────── */

function ChatGroup({
  title, chats, formatTime, userName,
}: {
  title: string;
  chats: ChatPreview[];
  formatTime: (iso: string | null) => string;
  userName?: string;
}) {
  if (chats.length === 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8, padding: '16px 20px 10px',
      }}>
        <span style={{
          fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1,
          color: 'rgba(255,255,255,0.30)', fontFamily: 'var(--font-display)',
        }}>
          {title.toLowerCase()}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.30)' }}>
          {chats.length}
        </span>
      </div>

      {chats.map((chat, index) => {
        const isOwn = chat.lastSender === userName;
        const hasMessage = !!chat.lastMessage;
        return (
          <Link key={chat.eventId} href={`/events/${chat.eventId}?chat=1`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 20px' }}>
              {/* People cluster — the room is its people, not a date.
                  Width must follow the avatars (up to 3 overlapping + a +N chip):
                  a fixed width let the 3rd avatar spill over the title. */}
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {chat.members.map((m, i) => (
                  <div key={i} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 5 - i }}>
                    <Avatar name={m.name} color={m.color} url={m.url} size={32} ringWidth={1.5} />
                  </div>
                ))}
                {chat.memberCount > chat.members.length && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', marginLeft: -9,
                    background: 'rgba(255,255,255,0.06)', border: '1.5px solid var(--bg-base)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: 700, zIndex: 0,
                  }}>+{chat.memberCount - chat.members.length}</div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3, gap: 8 }}>
                  <span style={{
                    fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: 'var(--text-primary)', flex: 1, minWidth: 0,
                  }}>
                    {chat.eventTitle}
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 500 }}>
                    {formatTime(chat.lastAt)}
                  </span>
                </div>
                <span style={{
                  fontSize: 13.5, color: hasMessage ? 'var(--text-secondary)' : 'var(--text-muted)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  display: 'block', fontStyle: hasMessage ? 'normal' : 'italic',
                }}>
                  {hasMessage ? `${isOwn ? 'You' : chat.lastSender}: ${chat.lastMessage}` : 'No messages yet'}
                </span>
              </div>

              <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, opacity: 0.5 }} />
            </div>

            {index < chats.length - 1 && (
              <div style={{ height: 0.5, background: 'var(--border-subtle)', marginLeft: 89, marginRight: 20, opacity: 0.6 }} />
            )}
          </Link>
        );
      })}
    </div>
  );
}

