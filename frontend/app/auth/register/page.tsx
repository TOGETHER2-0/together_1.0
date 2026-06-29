'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FACULTIES, FACULTY_COLORS, getFacultyColor } from '@/lib/faculties';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    faculty: '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const router = useRouter();
  const { setAuth } = useAuthStore();

  function handleChange(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      if (error) setError('');
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.faculty) { setError('Please select your faculty.'); return; }
    if (!formData.email.endsWith('@student.ju.se')) {
      setError('You must use a @student.ju.se email address.'); return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    try {
      const data = await authApi.register({
        full_name: formData.full_name,
        email:     formData.email,
        password:  formData.password,
        faculty:   formData.faculty,
      }) as any;
      setAuth(data.access_token, data.user);
      router.replace('/events');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string' ? detail
        : Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ')
        : 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const isFormValid =
    formData.full_name.trim() &&
    formData.email.trim() &&
    formData.password &&
    formData.confirmPassword &&
    formData.faculty;

  const selectedColor = getFacultyColor(formData.faculty || null);

  return (
    /*
      FIX SCROLL — Stessa causa di LoginPage: className="auth-bg app-shell"
      con overflowY:'auto' su un div flex:1 dentro un parent rotto.
      Il form di registrazione è il più lungo dell'app (6 campi + faculty
      grid + submit) — qui il bug era più visibile perché il contenuto
      eccede facilmente l'altezza viewport.

      Struttura corretta: height:100dvh flex column, un solo scroll
      container flex:1 overflow-y:auto che contiene tutto il form.
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
        width: 320, height: 320, top: -120, right: -80,
        background: `radial-gradient(circle, ${selectedColor}22 0%, transparent 70%)`,
        transition: 'background 0.6s ease',
      }} />
      <div className="blur-dot" style={{
        width: 260, height: 260, bottom: '15%', left: -80,
        background: `radial-gradient(circle, ${selectedColor}18 0%, transparent 70%)`,
        transition: 'background 0.6s ease',
      }} />

      {/* Unico scroll container — qui il fix conta più che altrove */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: 'calc(env(safe-area-inset-top) + 24px) 24px calc(env(safe-area-inset-bottom) + 36px)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Brand header */}
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: formData.faculty ? selectedColor : 'var(--brand-primary)',
            borderRadius: 16, marginBottom: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.4s ease',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800, fontSize: 28,
              color: '#fff', letterSpacing: '-0.04em', lineHeight: 1,
            }}>T</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800,
            letterSpacing: '-0.035em', marginBottom: 6,
            color: 'var(--text-primary)',
          }}>
            Join{' '}
            <span style={{
              color: formData.faculty ? selectedColor : 'var(--brand-primary)',
              transition: 'color 0.4s ease',
            }}>
              Together
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Create your JU student account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="form-group animate-fade-up stagger-1">
            <label className="form-label">Full name</label>
            <input
              className="input-field"
              type="text"
              placeholder="Emma Andersson"
              value={formData.full_name}
              onChange={handleChange('full_name')}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group animate-fade-up stagger-2">
            <label className="form-label">Student email</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@student.ju.se"
              value={formData.email}
              onChange={handleChange('email')}
              autoComplete="email"
              required
            />
            {formData.email && !formData.email.endsWith('@student.ju.se') && (
              <span style={{ fontSize: 12, color: 'var(--status-error-text)', marginTop: -4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertCircle size={13} strokeWidth={1.75} style={{ flexShrink: 0 }} /> Must end with @student.ju.se
              </span>
            )}
          </div>

          {/* Faculty pill grid */}
          <div className="form-group animate-fade-up stagger-2">
            <label className="form-label">Faculty / School</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {FACULTIES.map((f) => {
                const isSelected = formData.faculty === f;
                const fColor = FACULTY_COLORS[f];
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, faculty: f }))}
                    style={{
                      padding: '12px 14px', borderRadius: 14,
                      fontSize: 13, fontWeight: 700,
                      fontFamily: 'var(--font-display)', cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isSelected ? fColor : 'var(--border-subtle)',
                      background: isSelected ? `${fColor}18` : 'var(--bg-elevated)',
                      color: isSelected ? fColor : 'var(--text-secondary)',
                      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: isSelected ? `0 0 16px ${fColor}30` : 'none',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: fColor, flexShrink: 0,
                      boxShadow: isSelected ? `0 0 8px ${fColor}` : 'none',
                      transition: 'box-shadow 0.2s ease',
                    }} />
                    {f}
                  </button>
                );
              })}
            </div>

            <select
              value={formData.faculty}
              onChange={handleChange('faculty')}
              required
              aria-hidden="true"
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
            >
              <option value="" disabled />
              {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="form-group animate-fade-up stagger-3">
            <label className="form-label">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange('password')}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          <div className="form-group animate-fade-up stagger-3">
            <label className="form-label">Confirm password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              autoComplete="new-password"
              required
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <span style={{ fontSize: 12, color: 'var(--status-error-text)', marginTop: -4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertCircle size={13} strokeWidth={1.75} style={{ flexShrink: 0 }} /> Passwords don&apos;t match
              </span>
            )}
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
            className="btn btn-block btn-lg animate-fade-up stagger-4"
            disabled={loading || !isFormValid}
            style={{
              marginTop: 6,
              background: formData.faculty ? selectedColor : 'var(--brand-primary)',
              color: formData.faculty === 'JTH' || formData.faculty === 'Hälso' ? '#0A0A14' : '#fff',
              transition: 'background 0.4s ease',
              border: 'none',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="spinner spinner-sm" />
                Creating account…
              </span>
            ) : 'Create account'}
          </button>
        </form>

        <p className="animate-fade-up stagger-5" style={{
          textAlign: 'center', marginTop: 28,
          color: 'var(--text-muted)', fontSize: 14,
        }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{
            color: selectedColor, fontWeight: 700, textDecoration: 'none',
            transition: 'color 0.4s ease',
          }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
