'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Home, Compass, MessageSquare, User } from 'lucide-react';
import {
  startNotificationPolling,
  stopNotificationPolling,
} from '@/lib/notifications';
import { useAuthStore } from '@/lib/store';

const NAV_ITEMS = [
  { href: '/events',   label: 'events',  Icon: Home,          exactMatch: true  },
  { href: '/discover', label: 'explore', Icon: Compass,       exactMatch: true  },
  { href: '/chat',     label: 'chat',    Icon: MessageSquare, exactMatch: true  },
  { href: '/profile',  label: 'you',     Icon: User,          exactMatch: true  },
];

function isRouteActive(href: string, pathname: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

/* ─── Component — icon-only, product-grade ───────────────────── */

export default function BottomNav() {
  const pathname  = usePathname();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    startNotificationPolling();
    return () => stopNotificationPolling();
  }, [token]);

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map(item => {
          const active = isRouteActive(item.href, pathname, item.exactMatch);
          const color  = active ? 'var(--brand-mid)' : 'var(--text-muted)';
          const Icon   = item.Icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? ' active' : ''}`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="nav-item-icon">
                <Icon size={22} strokeWidth={active ? 2 : 1.75} color={color} />
              </div>
              <span className="nav-item-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
