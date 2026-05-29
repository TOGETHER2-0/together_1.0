'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, hydrateAuth } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    hydrateAuth();
  }, []);

  useEffect(() => {
    if (token) {
      router.replace('/events');
    } else {
      router.replace('/auth/login');
    }
  }, [token, router]);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
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
