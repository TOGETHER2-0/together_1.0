'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, hydrateAuth } from '@/lib/store';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { countryCodeToFlag } from '@/lib/countries';
import { authApi } from '@/lib/api';

// ── Language selector ──────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

function getStoredLang() {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem('together-lang')
    || navigator.language.split('-')[0]
    || 'en';
}

function LanguageSelector() {
  const [current, setCurrent] = useState('en');
  useEffect(() => { setCurrent(getStoredLang()); }, []);

  const choose = (code: string) => {
    setCurrent(code);
    localStorage.setItem('together-lang', code);
  };

  return (
    <div>
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12,
      }}>
        Language
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => choose(l.code)}
            style={{
              padding: '10px 16px', borderRadius: 14, cursor: 'pointer',
              border: `1.5px solid ${current === l.code ? '#7C5CFC' : 'var(--border-subtle)'}`,
              background: current === l.code ? 'rgba(124,92,252,0.12)' : 'var(--bg-elevated)',
              color: current === l.code ? '#7C5CFC' : 'var(--text-secondary)',
              fontWeight: current === l.code ? 700 : 500,
              fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.18s ease',
            }}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Logout section ─────────────────────────────────────────────
function LogoutSection() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch {
      // token già scaduto — logout locale comunque
    } finally {
      logout();
      router.replace('/auth/login');
    }
  };

  return (
    <div style={{
      marginTop: 8, paddingTop: 24,
      borderTop: '1px solid var(--border-subtle)',
    }}>
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          style={{
            width: '100%', padding: '14px', borderRadius: 14,
            border: '1.5px solid rgba(255,94,125,0.25)',
            background: 'rgba(255,94,125,0.06)',
            color: '#FF5E7D', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          Sign out
        </button>
      ) : (
        <div style={{
          background: 'rgba(255,94,125,0.08)',
          border: '1.5px solid rgba(255,94,125,0.25)',
          borderRadius: 16, padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', margin: 0 }}>
            Sign out of Together?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setConfirm(false)}
              style={{
                flex: 1, padding: '12px', borderRadius: 12,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-elevated)',
                fontWeight: 600, cursor: 'pointer', fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              style={{
                flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #FF5E7D, #FF3357)',
                color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────
export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => { hydrateAuth(); }, []);
  useEffect(() => {
    if (!token) router.replace('/auth/login');
  }, [token, router]);

  if (!user) return null;

  return (
    <div className="app-shell" style={{ background: 'var(--bg-base)' }}>
      <div className="blur-dot" style={{
        width: 320, height: 320, top: -100, right: -80,
        background: 'radial-gradient(circle, rgba(124,92,252,0.14) 0%, transparent 70%)',
      }} />

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '52px 24px 40px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header — invariato */}
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', fontSize: 14,
              cursor: 'pointer', padding: 0, marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ← Back
          </button>

          {/* Mini card profilo — invariata */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px', marginBottom: 28,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--brand-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: '#fff', fontWeight: 800,
              overflow: 'hidden', flexShrink: 0,
            }}>
              {user.avatar_url
                ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user.full_name[0]?.toUpperCase()
              }
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{user.full_name}</span>
                {user.country_code && (
                  <span style={{ fontSize: 18 }}>{countryCodeToFlag(user.country_code)}</span>
                )}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: 'var(--brand-primary)',
                background: 'rgba(124,92,252,0.12)',
                padding: '2px 10px', borderRadius: 20,
              }}>
                {user.faculty}
              </span>
              {user.bio && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28, fontWeight: 800,
            letterSpacing: '-0.03em', marginBottom: 6,
          }}>
            Edit profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {user.email}
          </p>
        </div>

        {/* Form profilo — invariato */}
        <ProfileEditForm
          initialName={user.full_name ?? ''}
          initialBio={user.bio ?? ''}
          initialAvatarUrl={user.avatar_url ?? ''}
          initialCountryCode={user.country_code ?? ''}
        />

        {/* ── NUOVO: Language selector ── */}
        <div style={{
          marginTop: 32, paddingTop: 24,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <LanguageSelector />
        </div>

        {/* ── NUOVO: Logout ── */}
        <LogoutSection />

        {/* Spazio fondo per bottom nav */}
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

