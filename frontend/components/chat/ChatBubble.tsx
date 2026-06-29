'use client';

import { ChatMessage } from '@/hooks/useEventChat';
import { countryCodeToFlag } from '@/lib/countries';
import { getInitials } from '@/lib/utils';

interface Props {
  msg:      ChatMessage;
  isOwn:    boolean;
  isFirst:  boolean; // primo della sequenza (stesso utente)
  isLast:   boolean; // ultimo della sequenza
  showTime: boolean; // mostra timestamp (solo sull'ultimo)
  animate:  boolean; // fade-up solo su messaggi nuovi
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// Calcola border-radius per effetto "coda" stile iMessage
function getBubbleRadius(isOwn: boolean, isFirst: boolean, isLast: boolean): string {
  const full  = '20px';
  const tight = '5px';

  if (isFirst && isLast) {
    // Messaggio singolo — fully rounded con coda
    return isOwn
      ? `${full} ${full} ${tight} ${full}`
      : `${full} ${full} ${full} ${tight}`;
  }
  if (isFirst) {
    // Top della sequenza
    return isOwn
      ? `${full} ${full} ${tight} ${full}`
      : `${full} ${full} ${full} ${tight}`;
  }
  if (isLast) {
    // Bottom della sequenza — coda qui
    return isOwn
      ? `${full} ${tight} ${tight} ${full}`
      : `${tight} ${full} ${full} ${tight}`;
  }
  // Metà sequenza — angoli stretti sul lato della coda
  return isOwn
    ? `${full} ${tight} ${tight} ${full}`
    : `${tight} ${full} ${full} ${tight}`;
}

const AVATAR_SIZE = 36;

export function ChatBubble({ msg, isOwn, isFirst, isLast, showTime, animate }: Props) {
  const flag     = msg.user.country_code ? countryCodeToFlag(msg.user.country_code) : null;
  const initials = getInitials(msg.user.full_name);
  const radius   = getBubbleRadius(isOwn, isFirst, isLast);

  // Margine verticale: più spazio tra sequenze diverse, compatto dentro
  const marginBottom = isLast ? 8 : 2;

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems:    'flex-end',
        gap:           8,
        marginBottom,
        // Padding laterale asimmetrico per creare prospettiva
        paddingLeft:  isOwn ? 52 : 0,
        paddingRight: isOwn ? 0  : 52,
        // Animazione entrata
        animation: animate ? 'bubbleIn 0.18s ease both' : 'none',
      }}
    >
      {/* ── Avatar (solo messaggi altrui) ─────────────────────── */}
      <div style={{
        width:     AVATAR_SIZE,
        flexShrink: 0,
        alignSelf: 'flex-end',
      }}>
        {!isOwn ? (
          // Mostra avatar sull'ultimo della sequenza, placeholder trasparente sugli altri
          isLast ? (
            <div style={{
              width:          AVATAR_SIZE,
              height:         AVATAR_SIZE,
              borderRadius:   13,
              overflow:       'hidden',
              background:     msg.user.avatar_color || '#7C3AED',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       13,
              fontWeight:     800,
              color:          '#fff',
              letterSpacing:  '-0.02em',
              boxShadow:      '0 2px 10px rgba(0,0,0,0.3)',
              flexShrink:     0,
            }}>
              {msg.user.avatar_url
                ? <img
                    src={msg.user.avatar_url}
                    alt={msg.user.full_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                : initials
              }
            </div>
          ) : (
            // Placeholder — mantiene l'allineamento delle bubble
            <div style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} />
          )
        ) : null}
      </div>

      {/* ── Colonna contenuto ─────────────────────────────────── */}
      <div style={{
        display:    'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        gap:        2,
        maxWidth:   '100%',
        minWidth:   0,
      }}>
        {/* Nome + bandiera — solo primo messaggio di altri */}
        {!isOwn && isFirst && (
          <div style={{
            display:     'flex',
            alignItems:  'center',
            gap:         5,
            paddingLeft: 14,
            marginBottom: 2,
          }}>
            <span style={{
              fontSize:      12,
              fontWeight:    700,
              color:         'var(--text-secondary)',
              letterSpacing: '0.01em',
            }}>
              {msg.user.full_name.split(' ')[0]}
            </span>
            {flag && <span style={{ fontSize: 13, lineHeight: 1 }}>{flag}</span>}
          </div>
        )}

        {/* ── Bolla testo ─────────────────────────────────────── */}
        <div style={{
          padding:      '10px 14px',
          borderRadius: radius,
          background:   isOwn
            ? 'var(--brand-primary)'
            : 'var(--bg-elevated)',
          border:       isOwn ? 'none' : '1px solid var(--border-subtle)',
          color:        isOwn ? '#fff' : 'var(--text-primary)',
          fontSize:     15,
          lineHeight:   1.5,
          wordBreak:    'break-word',
          whiteSpace:   'pre-wrap',
          boxShadow:    'none',
          // Transizione colore per hover futuro
          transition: 'opacity 0.15s ease',
        }}>
          {msg.text}
        </div>

        {/* ── Timestamp — solo sull'ultimo della sequenza ─────── */}
        {showTime && (
          <span style={{
            fontSize:    11,
            color:       'var(--text-muted)',
            paddingLeft:  isOwn ? 0   : 14,
            paddingRight: isOwn ? 14  : 0,
            marginTop:    2,
            letterSpacing: '0.02em',
          }}>
            {formatTime(msg.created_at)}
          </span>
        )}
      </div>

      <style>{`
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
}
