'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { useEventChat } from '@/hooks/useEventChat';
import { useAuthStore } from '@/lib/store';
import { ChatBubble }       from './ChatBubble';
import { ChatDateSeparator } from './ChatDateSeparator';
import { ChatInput }         from './ChatInput';

interface Props {
  eventId:    number;
  eventTitle: string;
  isOpen:     boolean;
  onClose:    () => void;
}

export function EventChatDrawer({ eventId, eventTitle, isOpen, onClose }: Props) {
  const { user }  = useAuthStore();
  const { messages, error, sending, sendMessage } = useEventChat(eventId);

  const [visible, setVisible] = useState(false);   // controlla il mount
  const [ready,   setReady]   = useState(false);   // controlla la slide-in animation
  const messagesRef = useRef<HTMLDivElement>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);

  // Traccia quanti messaggi c'erano all'apertura — per animare solo i nuovi
  const openCountRef = useRef(0);

  /* ── Mount / unmount con animazione ───────────────────────── */
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      openCountRef.current = messages.length;
      // Micro-delay per permettere il paint prima della transizione
      requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    } else {
      setReady(false);
      // Aspetta la slide-out prima di smontare
      const t = setTimeout(() => setVisible(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  /* ── Blocca scroll body senza layout jump ──────────────────── */
  useEffect(() => {
    if (!isOpen) return;

    // Salva la posizione corrente e blocca con overflow:hidden
    const scrollY = window.scrollY;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  /* ── Scroll automatico ai nuovi messaggi ──────────────────── */
  useEffect(() => {
    if (!messagesRef.current || !isOpen) return;
    const el = messagesRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  /* ── Arricchisce ogni messaggio con grouping metadata ──────── */
  const enriched = useMemo(() => {
    return messages.map((msg, i) => {
      const prev = messages[i - 1];
      const next = messages[i + 1];

      const sameAsPrev = prev && prev.user.id === msg.user.id
        && isSameMinuteGroup(prev.created_at, msg.created_at);
      const sameAsNext = next && next.user.id === msg.user.id
        && isSameMinuteGroup(msg.created_at, next.created_at);

      const isFirst = !sameAsPrev;
      const isLast  = !sameAsNext;

      const showDate = !prev
        || !isSameDay(prev.created_at, msg.created_at);

      const isOwn     = msg.user.id === user?.id;
      // Anima solo i messaggi arrivati dopo l'apertura del drawer
      const isNew     = i >= openCountRef.current;

      return { msg, isFirst, isLast, showTime: isLast, showDate, isOwn, isNew };
    });
  }, [messages, user?.id]);

  if (!visible) return null;

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position:  'fixed',
          inset:     0,
          background:'rgba(0,0,0,0.55)',
          zIndex:    49,
          opacity:   ready ? 1 : 0,
          transition:'opacity 0.28s ease',
        }}
      />

      {/* ── Drawer fullscreen ─────────────────────────────────── */}
      <div style={{
        position:      'fixed',
        inset:         0,
        zIndex:        50,
        display:       'flex',
        flexDirection: 'column',
        background:    'var(--bg-base)',
        // Slide-up animation
        transform:     ready ? 'translateY(0)' : 'translateY(100%)',
        transition:    'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
        // Safe areas
        paddingTop:    'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>

        {/* ── Header ────────────────────────────────────────── */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          gap:            12,
          padding:        '14px 16px',
          borderBottom:   '1px solid var(--border-subtle)',
          flexShrink:     0,
          background:     'var(--bg-base)',
        }}>
          {/* Back arrow */}
          <button
            onClick={onClose}
            aria-label="Close chat"
            style={{
              width:          40,
              height:         40,
              borderRadius:   14,
              background:     'var(--bg-elevated)',
              border:         '1px solid var(--border-subtle)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              flexShrink:     0,
              transition:     'background 0.15s ease',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 5l-7 7 7 7"
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Event icon */}
          <div style={{
            width:          40,
            height:         40,
            borderRadius:   14,
            background:     'var(--bg-elevated)',
            border:         '1px solid var(--border-subtle)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            color:          'var(--text-secondary)',
            flexShrink:     0,
          }}>
            <MessageSquare size={18} strokeWidth={1.75} />
          </div>

          {/* Title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: '0.09em',
              color:         'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom:  2,
            }}>
              Event coordination
            </p>
            <h3 style={{
              fontSize:      16,
              fontWeight:    800,
              letterSpacing: '-0.02em',
              overflow:      'hidden',
              textOverflow:  'ellipsis',
              whiteSpace:    'nowrap',
              color:         'var(--text-primary)',
              lineHeight:    1.2,
            }}>
              {eventTitle}
            </h3>
          </div>
        </div>

        {/* ── Messages ──────────────────────────────────────── */}
        <div
          ref={messagesRef}
          style={{
            flex:       1,
            overflowY:  'auto',
            overflowX:  'hidden',
            padding:    '12px 12px 4px',
            display:    'flex',
            flexDirection: 'column',
            // Momentum scrolling iOS
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior:      'contain',
          }}
        >
          {/* Errore connessione */}
          {error && (
            <div style={{
              margin:         '12px auto',
              padding:        '10px 18px',
              borderRadius:   12,
              background:     'rgba(251,113,133,0.1)',
              border:         '1px solid rgba(251,113,133,0.2)',
              color:          '#FB7185',
              fontSize:       13,
              textAlign:      'center',
            }}>
              {error}
            </div>
          )}

          {/* Empty state */}
          {!error && messages.length === 0 && (
            <div style={{
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              padding:        '60px 24px',
              gap:            14,
              textAlign:      'center',
            }}>
              <div style={{
                width:          64,
                height:         64,
                borderRadius:   20,
                background:     'var(--bg-elevated)',
                border:         '1px solid var(--border-subtle)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                color:          'var(--text-muted)',
                marginBottom:   4,
              }}>
                <MessageSquare size={24} strokeWidth={1.75} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>
                No messages yet
              </p>
              <p style={{
                color:      'var(--text-secondary)',
                fontSize:   14,
                lineHeight: 1.6,
                maxWidth:   240,
              }}>
                Use this thread to coordinate time, place, and details for the event.
              </p>
            </div>
          )}

          {/* Message list */}
          {enriched.map(({ msg, isFirst, isLast, showTime, showDate, isOwn, isNew }) => (
            <div key={msg.id}>
              {showDate && <ChatDateSeparator iso={msg.created_at} />}
              <ChatBubble
                msg={msg}
                isOwn={isOwn}
                isFirst={isFirst}
                isLast={isLast}
                showTime={showTime}
                animate={isNew}
              />
            </div>
          ))}

          <div ref={bottomRef} style={{ height: 8 }} />
        </div>

        {/* ── Input ─────────────────────────────────────────── */}
        <ChatInput onSend={sendMessage} sending={sending} />
      </div>
    </>
  );
}

/* ─── Helpers ────────────────────────────────────────────────── */

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth()    === db.getMonth()    &&
    da.getDate()     === db.getDate()
  );
}

// Raggruppa messaggi se arrivano entro 2 minuti l'uno dall'altro
function isSameMinuteGroup(a: string, b: string): boolean {
  const diff = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return diff < 2 * 60 * 1000; // 2 minuti
}
