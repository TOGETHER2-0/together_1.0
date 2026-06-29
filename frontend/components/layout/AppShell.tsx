'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, hydrateAuth } from '@/lib/store';
import BottomNav from './BottomNav';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router    = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateAuth();
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !token) router.replace('/auth/login');
  }, [ready, token, router]);

  if (!ready) {
    return (
      /*
        Durante l'hydration non usiamo #app-root perché non c'è BottomNav —
        usiamo un fullscreen centrato semplice.
      */
      <div style={{
        height:         '100dvh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            14,
        background:     'var(--bg-base)',
      }}>
        <div style={{
          width: 34, height: 34,
          border: '3px solid rgba(255,255,255,0.08)',
          borderTopColor: 'var(--brand-primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    );
  }

  if (!token) return null;

  return (
    <ErrorBoundary>
      {/*
        ┌─────────────────────────────┐  height: 100dvh
        │  status-bar-space           │  env(safe-area-inset-top)
        ├─────────────────────────────┤
        │                             │
        │  scroll-area   (flex: 1)    │  overflow-y: auto  ← UNICO scroll
        │                             │     padding-bottom: 0
        │                             │     (BottomNav è FUORI da qui)
        ├─────────────────────────────┤
        │  BottomNav  (flex-shrink:0) │  sticky bottom, MAI position:fixed
        │  + safe-area-bottom         │
        └─────────────────────────────┘

        FIX SCROLL:
        - #app-root: flex column, height 100dvh, overflow hidden
        - .scroll-area: flex 1, overflow-y auto — lo scroll avviene QUI
        - BottomNav: fuori da .scroll-area, non blocca mai lo scroll
        - Nessun padding-bottom artificiale in .scroll-area
          (ogni pagina gestisce il proprio padding interno se necessario)
        - position:sticky funziona dentro .scroll-area perché il parent
          scrollabile è <main>, non <body>
      */}
      <div
        id="app-root"
        style={{
          display:        'flex',
          flexDirection:  'column',
          height:         '100dvh',
          background:     'var(--bg-base)',
          overflow:       'hidden',        /* impedisce scroll su body */
          maxWidth:       430,
          margin:         '0 auto',
          position:       'relative',
        }}
      >
        {/* Notch / Dynamic Island spacer */}
        <div
          className="status-bar-space"
          aria-hidden="true"
          style={{ height: 'env(safe-area-inset-top, 0px)', flexShrink: 0 }}
        />

        {/* Scrollable content — unico elemento che scrolla */}
        <main
          className="scroll-area"
          style={{
            flex:                    1,
            overflowY:               'auto',
            overflowX:               'hidden',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY:     'contain',
            /*
              NON aggiungere padding-bottom qui.
              BottomNav è fuori da questo elemento — non sovrappone il contenuto.
              Ogni pagina aggiunge il proprio padding-bottom interno se ha
              elementi che devono respirare sopra il bordo inferiore.
            */
          }}
        >
          {children}
        </main>

        {/* BottomNav — static flex child, mai position:fixed */}
        <BottomNav />
      </div>
    </ErrorBoundary>
  );
}
