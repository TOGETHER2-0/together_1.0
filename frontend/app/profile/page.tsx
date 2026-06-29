'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LogOut } from 'lucide-react';
import { useAuthStore, hydrateAuth } from '@/lib/store';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { countryCodeToFlag } from '@/lib/countries';
import { getFacultyColor } from '@/lib/faculties';
import { authApi, eventsApi } from '@/lib/api';
import { Event } from '@/lib/types';
import { hexToRgba } from '@/lib/utils';
import AppShell from '@/components/layout/AppShell';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'sv', label: 'Svenska' },
];

/* ─── Page ───────────────────────────────────────────────────── */

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => { hydrateAuth(); }, []);
  useEffect(() => { if (!token) router.replace('/auth/login'); }, [token, router]);
  useEffect(() => {
    if (!token) return;
    eventsApi.list().then(d => setEvents(Array.isArray(d) ? d : [])).catch(() => {});
  }, [token]);

  if (!user) return null;

  const me        = user.id;
  const hosting   = events.filter(e => e.host.id === me).length;
  const going     = events.filter(e => e.host.id !== me &&
    e.join_requests.some(r => r.user.id === me && r.status === 'approved')).length;
  const total     = hosting + going;
  const ringColor = user.faculty ? getFacultyColor(user.faculty) : 'var(--brand-primary)';

  return (
    <AppShell>
      {/* ── Identity hero — editorial, left-aligned ─────────────── */}
      <div style={{
        padding: '14px 20px 20px',
        borderBottom: '0.5px solid var(--border-subtle)',
        background: `radial-gradient(120% 90% at 0% 0%, ${hexToRgba(ringColor, 0.08)} 0%, transparent 55%)`,
      }}>
        <button onClick={() => router.back()} aria-label="Back" style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: 13, cursor: 'pointer', padding: '0 0 18px',
          display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, fontFamily: 'var(--font-body)',
        }}>
          <ChevronLeft size={16} /> back
        </button>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: user.avatar_color || 'var(--brand-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 27, color: '#fff', fontWeight: 800, overflow: 'hidden',
            fontFamily: 'var(--font-display)',
            /* Faculty identity lives in the ring colour — no text badge. */
            border: user.faculty ? `3px solid ${ringColor}` : '1px solid rgba(255,255,255,0.1)',
            outline: user.faculty ? '2px solid var(--bg-base)' : 'none',
            outlineOffset: 1,
          }}>
            {user.avatar_url
              ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user.full_name[0]?.toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
                letterSpacing: '-0.035em', color: 'var(--text-primary)', lineHeight: 1.1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.full_name}
              </h1>
              {user.country_code && (
                <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{countryCodeToFlag(user.country_code)}</span>
              )}
            </div>

            {user.faculty && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: ringColor }} />
                {user.faculty}
              </span>
            )}

            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{user.email}</p>
          </div>
        </div>

        {user.bio && (
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: 14 }}>
            {user.bio}
          </p>
        )}

        {/* ── Stats — who you are in the network ───────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 18 }}>
          <Stat value={total}   label="events" />
          <Stat value={hosting} label="hosting" />
          <Stat value={going}   label="going" />
        </div>
      </div>

      <div style={{ padding: '22px 20px 48px' }}>
        {/* ── Edit profile ──────────────────────────────────────── */}
        <SectionTitle>your details</SectionTitle>
        <ProfileEditForm
          initialName={user.full_name ?? ''}
          initialBio={user.bio ?? ''}
          initialAvatarUrl={user.avatar_url ?? ''}
          initialCountryCode={user.country_code ?? ''}
        />

        {/* ── Language ──────────────────────────────────────────── */}
        <Divider />
        <SectionTitle>language</SectionTitle>
        <LanguageSelector />

        {/* ── Account ───────────────────────────────────────────── */}
        <Divider />
        <LogoutSection />
      </div>
    </AppShell>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border-subtle)',
      borderRadius: 14, padding: '12px 10px', textAlign: 'center',
    }}>
      <div style={{
        fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1,
        letterSpacing: '-0.04em', fontFamily: 'var(--font-display)',
      }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ─── Pieces ─────────────────────────────────────────────────── */

function Divider() {
  return <div style={{ height: 0.5, background: 'var(--border-subtle)', margin: '28px 0 22px' }} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 20, fontWeight: 800, letterSpacing: '-0.04em',
      color: 'rgba(255,255,255,0.30)', marginBottom: 16, fontFamily: 'var(--font-display)',
    }}>
      {children}
    </p>
  );
}

function LanguageSelector() {
  // v1 is English-only. The account still carries `user.language` as backend
  // data, but the UI has no translation layer yet — so the picker is shown
  // locked (English active, others disabled) with a "coming soon" note rather
  // than exposing a non-functional toggle. No dynamic behaviour, no API call.
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {LANGUAGES.map(l => {
          const active = l.code === 'en';
          return (
            <button key={l.code} type="button" disabled aria-disabled="true" style={{
              padding: '10px 18px', borderRadius: 13, cursor: 'default', fontSize: 14,
              border: `1px solid ${active ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
              background: active ? 'var(--bg-elevated)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: active ? 700 : 500, fontFamily: 'var(--font-body)',
              opacity: active ? 1 : 0.5,
            }}>
              {l.label}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 10 }}>
        More languages coming soon — Together is in English for now.
      </p>
    </div>
  );
}

function LogoutSection() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try { await authApi.logout(); } catch {}
    finally { logout(); router.replace('/auth/login'); }
  };

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} style={{
        width: '100%', padding: '15px', borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(251,113,133,0.25)', background: 'rgba(251,113,133,0.06)',
        color: '#FB7185', fontWeight: 600, fontSize: 15, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'var(--font-body)',
      }}>
        <LogOut size={16} /> Sign out
      </button>
    );
  }

  return (
    <div style={{
      background: 'rgba(251,113,133,0.07)', border: '1px solid rgba(251,113,133,0.22)',
      borderRadius: 'var(--radius-md)', padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <p style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', color: 'var(--text-primary)' }}>
        Sign out of Together?
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setConfirm(false)} style={{
          flex: 1, padding: '13px', borderRadius: 13, border: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontWeight: 600,
          cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)',
        }}>
          Cancel
        </button>
        <button onClick={handleLogout} disabled={loading} style={{
          flex: 1, padding: '13px', borderRadius: 13, border: 'none', background: '#FB7185',
          color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 14, opacity: loading ? 0.7 : 1, fontFamily: 'var(--font-body)',
        }}>
          {loading ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
