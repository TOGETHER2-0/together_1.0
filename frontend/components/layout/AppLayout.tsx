'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, hydrateAuth } from '@/lib/store';
import BottomNav from './BottomNav';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateAuth();
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !token) {
      router.replace('/auth/login');
    }
  }, [ready, token, router]);

  if (!ready) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#7C5CFC',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!token) return null;

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <main className="page-content">
          {children}
        </main>
        <BottomNav />
      </div>
    </ErrorBoundary>
  );
}
