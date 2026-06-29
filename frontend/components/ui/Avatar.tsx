'use client';

import { getInitials } from '@/lib/utils';

/**
 * Avatar — the single canonical face primitive for the whole app.
 *
 * Consolidates the previously duplicated Face / SpotFace / Avatar / AvatarCircle
 * components. Every face in Together (cards, hero, people strip, chat, event
 * detail) renders through this. The rendering formula is the one established by
 * EventCard: a circle, brand-coloured fallback, white initial at fontSize =
 * size × 0.38, weight 700, image cover when an avatar_url exists.
 *
 * `ringWidth` defaults to 0 (no border). Pass ringWidth/ringColor to get the
 * overlap-cluster ring used in face stacks.
 */
interface Props {
  name: string;
  color?: string | null;
  url?: string | null;
  size: number;
  ringWidth?: number;
  ringColor?: string;
  style?: React.CSSProperties;
}

export function Avatar({
  name,
  color,
  url,
  size,
  ringWidth = 0,
  ringColor = 'var(--bg-base)',
  style,
}: Props) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: color || '#7C3AED',
        overflow: 'hidden',
        border: ringWidth ? `${ringWidth}px solid ${ringColor}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        fontSize: Math.round(size * 0.38),
        letterSpacing: '-0.02em',
        ...style,
      }}
    >
      {url
        ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : getInitials(name).charAt(0)}
    </div>
  );
}
