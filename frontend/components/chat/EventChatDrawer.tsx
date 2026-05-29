'use client';
import { useEffect, useRef, useState } from 'react';
import { useEventChat } from '@/hooks/useEventChat';
import { ChatBubble } from './ChatBubble';
import { useAuthStore } from '@/lib/store';

interface Props {
  eventId:    number;
  eventTitle: string;
  isOpen:     boolean;
  onClose:    () => void;
}

export function EventChatDrawer({ eventId, eventTitle, isOpen, onClose }: Props) {
  const { user } = useAuthStore();
  const { messages, error, sending, sendMessage } = useEventChat(eventId);
  const [input,    setInput]    = useState('');
  const [sendErr,  setSendErr]  = useState(false);
  const [visible,  setVisible]  = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

  // Animazione mount/unmount
  useEffect(() => {
    if (isOpen) {
      // Piccolo delay per permettere al DOM di montare prima della transizione
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Scroll automatico solo se l'utente è già in fondo
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (isAtBottom || messages.length <= 1) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Blocca scroll body quando aperto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Focus input all'apertura
  useEffect(() => {
    if (isOpen && visible) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, visible]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSendErr(false);
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = 'auto';
    try {
      await sendMessage(text);
    } catch {
      setInput(text);
      setSendErr(true);
    }
  };

  // Calcola proprietà di raggruppamento per ogni messaggio
  function getMsgProps(i: number) {
    const msg  = messages[i];
    const prev = messages[i - 1];
    const next = messages[i + 1];

    const samePrev = prev && prev.user.id === msg.user.id &&
      new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60 * 1000;
    const sameNext = next && next.user.id === msg.user.id &&
      new Date(next.created_at).getTime() - new Date(msg.created_at).getTime() < 5 * 60 * 1000;

    return {
      isFirst:       !samePrev,
      isLast:        !sameNext,
      isConsecutive: !!samePrev,
      showAvatar:    !samePrev,
    };
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 49,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer — quasi fullscreen su mobile */}
      <div style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        // Su mobile: parte dall'8% per lasciare solo un piccolo hint che c'è qualcosa sotto
        top: '6%',
        zIndex: 50,
        background: 'var(--bg-base)',
        borderRadius: '24px 24px 0 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        // Safe area per notch/home indicator
        paddingBottom: 'env(safe-area-inset-bottom)',
        // Animazione slide-up
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
        // Ombra profonda sopra
        boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
      }}>

        {/* Handle pill */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.15)',
          margin: '12px auto 0',
          flexShrink: 0,
        }} />

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          {/* Icona evento */}
          <div style={{
            width: 42, height: 42,
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(124,92,252,0.18), rgba(255,94,125,0.18))',
            border: '1px solid rgba(124,92,252,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            💬
          </div>

          {/* Titolo */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 10, fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: 2,
            }}>
              Event Chat
            </p>
            <h3 style={{
              fontSize: 16, fontWeight: 800,
              letterSpacing: '-0.025em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}>
              {eventTitle}
            </h3>
          </div>

          {/* Chiudi */}
          <button
            onClick={onClose}
            aria-label="Close chat"
            style={{
              width: 36, height: 36,
              borderRadius: 12,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18"
                stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Messaggi */}
        <div
          ref={listRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '12px 12px 4px',
            display: 'flex',
            flexDirection: 'column',
            // Scrollbar invisible su mobile
            scrollbarWidth: 'none',
          }}
        >
          <style>{`
            div::-webkit-scrollbar { display: none; }
            @keyframes msgIn {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Errore */}
          {error && (
            <div style={{
              textAlign: 'center',
              color: '#FF5E7D',
              fontSize: 13,
              padding: '16px 0',
            }}>
              {error}
            </div>
          )}

          {/* Empty state */}
          {!error && messages.length === 0 && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 32px',
              gap: 10,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 48,
                marginBottom: 4,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
              }}>👋</div>
              <p style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>
                No messages yet
              </p>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: 14,
                lineHeight: 1.55,
                maxWidth: 220,
              }}>
                Say hi to the other attendees!
              </p>
            </div>
          )}

          {/* Lista messaggi con separatori data e raggruppamento */}
          {messages.map((msg, i) => {
            const prev = messages[i - 1];
            const showDate = !prev ||
              new Date(msg.created_at).toDateString() !==
              new Date(prev.created_at).toDateString();
            const isOwn = msg.user.id === user?.id;
            const props = getMsgProps(i);

            return (
              <div
                key={msg.id}
                style={{ animation: 'msgIn 0.2s ease forwards' }}
              >
                {showDate && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    margin: '16px 0 10px',
                  }}>
                    <div style={{
                      flex: 1,
                      height: 1,
                      background: 'var(--border-subtle)',
                    }} />
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>
                      {new Date(msg.created_at).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </span>
                    <div style={{
                      flex: 1,
                      height: 1,
                      background: 'var(--border-subtle)',
                    }} />
                  </div>
                )}

                <ChatBubble
                  msg={msg}
                  isOwn={isOwn}
                  showAvatar={props.showAvatar}
                  isFirst={props.isFirst}
                  isLast={props.isLast}
                  isConsecutive={props.isConsecutive}
                />
              </div>
            );
          })}

          <div ref={bottomRef} style={{ height: 8 }} />
        </div>

        {/* Input area */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-base)',
          flexShrink: 0,
          padding: '10px 12px 12px',
        }}>
          {/* Errore invio */}
          {sendErr && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              background: 'rgba(255,94,125,0.1)',
              borderRadius: 10,
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 13 }}>⚠️</span>
              <p style={{ fontSize: 12.5, color: '#FF5E7D', fontWeight: 600 }}>
                Message failed — tap Send to retry
              </p>
            </div>
          )}

          {/* Barra input */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
            background: 'var(--bg-elevated)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 22,
            padding: '8px 8px 8px 16px',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message…"
              rows={1}
              maxLength={2000}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 15,
                lineHeight: 1.5,
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                maxHeight: 120,
                minHeight: 24,
                padding: '2px 0',
                // Scrollbar nascosta nella textarea
                scrollbarWidth: 'none',
              }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              aria-label="Send message"
              style={{
                width: 40, height: 40,
                borderRadius: 14,
                flexShrink: 0,
                background: input.trim()
                  ? 'linear-gradient(135deg, #7C5CFC, #FF5E7D)'
                  : 'var(--bg-base)',
                border: input.trim()
                  ? 'none'
                  : '1.5px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !sending ? 'pointer' : 'default',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: input.trim() ? 'scale(1)' : 'scale(0.88)',
                opacity: sending ? 0.6 : 1,
                boxShadow: input.trim()
                  ? '0 4px 14px rgba(124,92,252,0.45)'
                  : 'none',
              }}
            >
              {sending ? (
                // Spinner mentre invia
                <div style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke={input.trim() ? '#fff' : 'var(--text-muted)'}
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"
                    fill={input.trim() ? '#fff' : 'none'}
                    stroke={input.trim() ? '#fff' : 'var(--text-muted)'}
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>

          {/* Hint keyboard */}
          <p style={{
            fontSize: 10.5,
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: 6,
            opacity: 0.7,
          }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}
