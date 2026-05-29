'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useNotificationStore, startNotificationPolling, stopNotificationPolling } from '@/lib/notifications';
import { useAuthStore } from '@/lib/store';

const NAV_ITEMS = [
  {
    href: '/events',
    label: 'Discover',
    icon: (active: boolean) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={active ? '0' : '1.8'}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/map',
    label: 'Map',
    icon: (active: boolean) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={active ? '0' : '1.8'}
        />
        <circle
          cx="12" cy="9" r="2.5"
          fill={active ? '#080810' : 'none'}
          stroke={active ? 'none' : 'currentColor'}
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    href: '/events/new',
    label: '',
    isCreate: true,
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    ),
  },
  // ← NUOVO
  {
    href: '/chat',
    label: 'Chat',
    isChat: true,
    icon: (active: boolean) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={active ? '0' : '1.8'}
          strokeLinejoin="round"
        />
        {!active && (
          <>
            <path d="M8 10h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </>
        )}
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    isProfile: true,
    icon: (active: boolean) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="4"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={active ? '0' : '1.8'}
        />
        <path
          d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { token } = useAuthStore();
  const pendingCount = useNotificationStore(s => s.pendingCount);

  useEffect(() => {
    if (!token) return;
    startNotificationPolling();
    return () => stopNotificationPolling();
  }, [token]);

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/events/new' &&
             item.href !== '/map' &&
             item.href !== '/profile' &&
             item.href !== '/chat' &&
             pathname.startsWith(item.href + '/'));

          if (item.isCreate) {
            return (
              <Link key={item.href} href={item.href} className="nav-item" style={{ flex: '0 0 auto' }}>
                <div style={{
                  width: 54, height: 54,
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #7C5CFC, #FF5E7D)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 24px rgba(124,92,252,0.55), inset 0 1px 0 rgba(255,255,255,0.2)',
                  transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  marginTop: -10,
                }}>
                  {item.icon(false)}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-item-icon" style={{ position: 'relative' }}>
                {item.icon(isActive)}

                {/* Badge notifiche su Profile */}
                {item.isProfile && pendingCount > 0 && (
                  <div style={{
                    position: 'absolute', top: -3, right: -3,
                    width: 16, height: 16,
                    background: '#FF5E7D',
                    borderRadius: '50%',
                    border: '2px solid rgba(15,15,28,0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 800, color: '#fff',
                    fontFamily: 'var(--font-display)',
                  }}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </div>
                )}
              </div>
              {item.label && (
                <span className="nav-item-label">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
