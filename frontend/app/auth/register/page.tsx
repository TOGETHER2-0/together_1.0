'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const [error, setError] = useState('');
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

    if (!formData.faculty) {
      setError('Please select your faculty.');
      return;
    }
    if (!formData.email.endsWith('@student.ju.se')) {
      setError('You must use a @student.ju.se email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        faculty: formData.faculty,
      });
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
    <div className="auth-bg app-shell">
      {/* Ambient blobs — change color based on selected faculty */}
      <div className="blur-dot" style={{
        width: 320, height: 320,
        top: -120, right: -80,
        background: `radial-gradient(circle, ${selectedColor}22 0%, transparent 70%)`,
        transition: 'background 0.6s ease',
      }} />
      <div className="blur-dot" style={{
        width: 260, height: 260,
        bottom: '15%', left: -80,
        background: `radial-gradient(circle, ${selectedColor}18 0%, transparent 70%)`,
        transition: 'background 0.6s ease',
      }} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 24px 36px',
        position: 'relative',
        zIndex: 1,
        overflowY: 'auto',
      }}>
        {/* Brand header */}
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: formData.faculty
              ? `linear-gradient(135deg, ${selectedColor}, ${selectedColor}AA)`
              : 'var(--brand-gradient)',
            borderRadius: 18,
            marginBottom: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: formData.faculty
              ? `0 8px 32px ${selectedColor}50`
              : 'var(--shadow-brand)',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            🤝
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: '-0.035em',
            marginBottom: 6,
          }}>
            Join{' '}
            <span style={{
              background: formData.faculty
                ? `linear-gradient(135deg, ${selectedColor}, ${selectedColor}BB)`
                : 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              transition: 'all 0.5s ease',
            }}>
              Together
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Create your JU student account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Full name */}
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

          {/* Email */}
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
              <span style={{ fontSize: 12, color: '#FF5E7D', marginTop: -4 }}>
                ⚠ Must end with @student.ju.se
              </span>
            )}
          </div>

          {/* Faculty — pill selector (primary) + hidden select for form validity */}
          <div className="form-group animate-fade-up stagger-2">
            <label className="form-label">Faculty / School</label>

            {/* Visual pill grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}>
              {FACULTIES.map((f) => {
                const isSelected = formData.faculty === f;
                const fColor = FACULTY_COLORS[f];
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, faculty: f }))}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 14,
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: isSelected ? fColor : 'var(--border-subtle)',
                      background: isSelected ? `${fColor}18` : 'var(--bg-elevated)',
                      color: isSelected ? fColor : 'var(--text-secondary)',
                      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: isSelected ? `0 0 16px ${fColor}30` : 'none',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <span style={{
                      width: 8, height: 8,
                      borderRadius: '50%',
                      background: fColor,
                      flexShrink: 0,
                      boxShadow: isSelected ? `0 0 8px ${fColor}` : 'none',
                      transition: 'box-shadow 0.2s ease',
                    }} />
                    {f}
                  </button>
                );
              })}
            </div>

            {/* Hidden native select for form validation fallback */}
            <select
              value={formData.faculty}
              onChange={handleChange('faculty')}
              required
              aria-hidden="true"
              style={{
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none',
                width: 0,
                height: 0,
              }}
            >
              <option value="" disabled />
              {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Password */}
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

          {/* Confirm password */}
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
              <span style={{ fontSize: 12, color: '#FF5E7D', marginTop: -4 }}>
                ⚠ Passwords don't match
              </span>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="animate-scale-in" style={{
              background: 'rgba(255,51,87,0.10)',
              border: '1px solid rgba(255,94,125,0.28)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: '#FF5E7D',
              fontSize: 13.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 500,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-block btn-lg animate-fade-up stagger-4"
            disabled={loading || !isFormValid}
            style={{
              marginTop: 6,
              background: formData.faculty
                ? `linear-gradient(135deg, ${selectedColor}, ${selectedColor}CC)`
                : 'var(--brand-gradient)',
              color: formData.faculty === 'JTH' || formData.faculty === 'Hälso'
                ? '#0A0A14'
                : '#fff',
              boxShadow: formData.faculty
                ? `0 8px 32px ${selectedColor}45`
                : 'var(--shadow-brand)',
              transition: 'all 0.4s ease',
              border: 'none',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="spinner spinner-sm" />
                Creating account…
              </span>
            ) : 'Create account →'}
          </button>
        </form>

        <p className="animate-fade-up stagger-5" style={{
          textAlign: 'center',
          marginTop: 28,
          color: 'var(--text-muted)',
          fontSize: 14,
        }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{
            color: selectedColor,
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'color 0.4s ease',
          }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
