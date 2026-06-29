'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore, hydrateAuth } from '@/lib/store';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [ready,    setReady]    = useState(false);
  const router = useRouter();
  const { setAuth, token } = useAuthStore();

  useEffect(() => {
    hydrateAuth();
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && token) router.replace('/events');
  }, [ready, token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email: email.trim(), password }) as any;
      setAuth(data.access_token, data.user);
      router.replace('/events');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string' ? detail
        : Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ')
        : 'Login failed. Check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    /*
      FIX — Pagine auth (pre-login) non usano AppShell perché non hanno
      BottomNav. Usavano className="auth-bg app-shell" che referenziava
      la vecchia classe .app-shell (height:100dvh + overflow-y:auto su
      un elemento senza display:flex column corretto).

      Ora la struttura è esplicita: un div height:100dvh, display:flex
      column, con un unico figlio scrollabile flex:1 overflow-y:auto.
      Stessa logica di #app-root ma senza BottomNav, max-width, o status-bar-space
      (le pagine auth occupano l'intero schermo, non sono dentro la shell app).
    */
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="blur-dot" style={{
        width: 360, height: 360, top: -140, left: -80,
        background: 'radial-gradient(circle, rgba(124,92,252,0.16) 0%, transparent 70%)',
      }} />
      <div className="blur-dot" style={{
        width: 280, height: 280, bottom: '10%', right: -80,
        background: 'radial-gradient(circle, rgba(251,113,133,0.12) 0%, transparent 70%)',
      }} />

      {/* Unico scroll container della pagina */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'calc(env(safe-area-inset-top) + 32px) 24px calc(env(safe-area-inset-bottom) + 40px)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div className="animate-fade-up" style={{ marginBottom: 40 }}>
          <div style={{
            width: 60, height: 60,
            background: 'var(--brand-gradient)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
            boxShadow: 'var(--shadow-brand)',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800, fontSize: 30,
              color: '#fff', letterSpacing: '-0.04em', lineHeight: 1,
            }}>T</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 34, fontWeight: 800,
            letterSpacing: '-0.04em', marginBottom: 8,
            color: 'var(--text-primary)',
          }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Sign in to your JU account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group animate-fade-up stagger-1">
            <label className="form-label">Student email</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@student.ju.se"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group animate-fade-up stagger-2">
            <label className="form-label">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="animate-scale-in" style={{
              background: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: 'var(--status-error-text)',
              fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8,
              fontWeight: 500,
            }}>
              <AlertCircle size={15} strokeWidth={1.75} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg animate-fade-up stagger-3"
            disabled={loading || !email || !password}
            style={{ marginTop: 6 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="spinner spinner-sm" />
                Signing in…
              </span>
            ) : 'Sign in'}
          </button>
        </form>

        <p className="animate-fade-up stagger-4" style={{
          textAlign: 'center', marginTop: 28,
          color: 'var(--text-muted)', fontSize: 14,
        }}>
          New to Together?{' '}
          <Link href="/auth/register" style={{
            color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none',
          }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
