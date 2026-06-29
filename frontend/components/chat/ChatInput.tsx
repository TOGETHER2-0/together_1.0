'use client';

import { useRef, useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  onSend:   (text: string) => Promise<void>;
  sending:  boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, sending, disabled }: Props) {
  const [value,   setValue]   = useState('');
  const [error,   setError]   = useState(false);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !sending && !disabled;

  // Auto-resize textarea — max 5 righe (~120px)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    setError(false);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleSend = useCallback(async () => {
    const text = value.trim();
    if (!text || sending) return;
    setValue('');
    setError(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
    try {
      await onSend(text);
    } catch {
      setValue(text); // ripristina se fallisce
      setError(true);
    }
  }, [value, sending, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      flexShrink: 0,
      padding:    '8px 12px 12px',
      background: 'var(--bg-base)',
      borderTop:  '1px solid var(--border-subtle)',
    }}>
      {/* Errore invio */}
      {error && (
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          6,
          fontSize:     12,
          color:        '#FB7185',
          marginBottom: 8,
          paddingLeft:  4,
        }}>
          <AlertCircle size={13} strokeWidth={1.75} />
          <span>Message failed — tap Send to retry</span>
        </div>
      )}

      {/* Input row */}
      <div style={{
        display:     'flex',
        alignItems:  'flex-end',
        gap:         10,
        background:  'var(--bg-elevated)',
        border:      `1px solid ${focused ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
        borderRadius: 22,
        padding:     '9px 9px 9px 16px',
        transition:  'border-color 0.18s ease, box-shadow 0.18s ease',
        boxShadow:   focused ? '0 0 0 3px rgba(124,58,237,0.16)' : 'none',
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Message…"
          rows={1}
          maxLength={2000}
          style={{
            flex:       1,
            background: 'transparent',
            border:     'none',
            outline:    'none',
            resize:     'none',
            fontSize:   15,
            lineHeight: 1.45,
            color:      'var(--text-primary)',
            fontFamily: 'inherit',
            maxHeight:  120,
            minHeight:  22,
            overflowY:  'auto',
            padding:    0,
            margin:     0,
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          style={{
            width:      38,
            height:     38,
            borderRadius: 14,
            flexShrink: 0,
            background: canSend
              ? 'var(--brand-primary)'
              : 'transparent',
            border: canSend
              ? 'none'
              : '1px solid var(--border-subtle)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            cursor:    canSend ? 'pointer' : 'default',
            transition: 'background 0.18s ease, opacity 0.18s ease',
            opacity:   canSend ? 1 : 0.4,
            boxShadow: 'none',
          }}
        >
          {sending ? (
            // Spinner mentre invia
            <div style={{
              width:       16,
              height:      16,
              border:      '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation:   'spin 0.65s linear infinite',
            }} />
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13"
                stroke={canSend ? '#fff' : 'var(--text-muted)'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                fill={canSend ? '#fff' : 'none'}
                stroke={canSend ? '#fff' : 'var(--text-muted)'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
