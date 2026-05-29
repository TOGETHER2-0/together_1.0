'use client';
import { ChatMessage } from '@/hooks/useEventChat';
import { countryCodeToFlag } from '@/lib/countries';
import { getInitials } from '@/lib/utils';

interface Props {
  msg:         ChatMessage;
  isOwn:       boolean;
  showAvatar:  boolean;
  isFirst:     boolean; // primo del gruppo (mostra nome)
  isLast:      boolean; // ultimo del gruppo (mostra timestamp + avatar)
  isConsecutive: boolean; // stesso mittente del precedente
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('it-IT', {
    hour: '2-digit', minute: '2-digit',
  });
}

// Border radius per bubble raggruppate stile iMessage/Telegram
function getBubbleRadius(isOwn: boolean, isFirst: boolean, isLast: boolean): string {
  const R = '20px';
  const r = '5px';

  if (isOwn) {
    // Lato destro: angolo bottom-right si arrotonda solo sull'ultimo
    if (isFirst && isLast) return `${R} ${R} ${r} ${R}`;
    if (isFirst)            return `${R} ${R} ${r} ${R}`;
    if (isLast)             return `${R} ${R} ${r} ${R}`;
    return                         `${R} ${r} ${r} ${R}`;
  } else {
    // Lato sinistro: angolo bottom-left si arrotonda solo sull'ultimo
    if (isFirst && isLast) return `${R} ${R} ${R} ${r}`;
    if (isFirst)            return `${R} ${R} ${r} ${r}`;
    if (isLast)             return `${r} ${R} ${R} ${r}`;
    return                         `${r} ${R} ${R} ${r}`;
  }
}

export function ChatBubble({ msg, isOwn, showAvatar, isFirst, isLast, isConsecutive }: Props) {
  const flag = msg.user.country_code ? countryCodeToFlag(msg.user.country_code) : null;
  const initials = getInitials(msg.user.full_name);
  const radius = getBubbleRadius(isOwn, isFirst, isLast);

  // Gap tra messaggi: ridotto se consecutivi, normale altrimenti
  const marginBottom = isLast ? 6 : 2;

  return (
    <div style={{
      display: 'flex',
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom,
      paddingLeft: isOwn ? 48 : 0,
      paddingRight: isOwn ? 0 : 48,
    }}>

      {/* Avatar — occupa spazio fisso, visibile solo sull'ultimo del gruppo */}
      <div style={{ width: 34, flexShrink: 0, alignSelf: 'flex-end' }}>
        {!isOwn && (
          isLast ? (
            <div style={{
              width: 34, height: 34,
              borderRadius: 12,
              background: msg.user.avatar_color || '#7C5CFC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: '#fff', fontWeight: 800,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              flexShrink: 0,
            }}>
              {msg.user.avatar_url
                ? <img src={msg.user.avatar_url} alt={initials}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
          ) : (
            // Segnaposto invisibile per allineare le bolle
            <div style={{ width: 34 }} />
          )
        )}
      </div>

      {/* Colonna bubble */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        gap: 1,
        maxWidth: '100%',
      }}>

        {/* Nome mittente — solo primo del gruppo, solo altri */}
        {!isOwn && isFirst && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            paddingLeft: 14, marginBottom: 2,
          }}>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: msg.user.avatar_color || 'var(--text-secondary)',
              letterSpacing: '0.01em',
            }}>
              {msg.user.full_name.split(' ')[0]}
            </span>
            {flag && <span style={{ fontSize: 13 }}>{flag}</span>}
          </div>
        )}

        {/* Bubble */}
        <div style={{
          padding: isOwn ? '10px 16px' : '10px 15px',
          borderRadius: radius,
          background: isOwn
            ? 'linear-gradient(135deg, #7C5CFC 0%, #9B6FFF 50%, #FF5E7D 100%)'
            : 'var(--bg-elevated)',
          border: isOwn ? 'none' : '1px solid var(--border-subtle)',
          color: isOwn ? '#fff' : 'var(--text-primary)',
          fontSize: 15,
          lineHeight: 1.45,
          wordBreak: 'break-word',
          letterSpacing: '-0.01em',
          // Ombra leggera sulle bubble proprie
          boxShadow: isOwn
            ? '0 4px 16px rgba(124,92,252,0.35)'
            : '0 1px 4px rgba(0,0,0,0.12)',
        }}>
          {msg.text}
        </div>

        {/* Timestamp — solo ultimo del gruppo */}
        {isLast && (
          <span style={{
            fontSize: 10.5,
            color: 'var(--text-muted)',
            paddingLeft: isOwn ? 0 : 14,
            paddingRight: isOwn ? 2 : 0,
            marginTop: 2,
          }}>
            {formatTime(msg.created_at)}
          </span>
        )}
      </div>
    </div>
  );
}
