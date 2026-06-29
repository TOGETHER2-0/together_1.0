'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';
import { COUNTRIES } from '@/lib/countries';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';

interface Props {
  initialName:        string;
  initialBio:         string;
  initialAvatarUrl:   string;
  initialCountryCode: string;
  onUpdated?: (u: Record<string, string>) => void;
}

export function ProfileEditForm({
  initialName,
  initialBio,
  initialAvatarUrl,
  initialCountryCode,
  onUpdated,
}: Props) {
  const [name,        setName]        = useState(initialName);
  const [bio,         setBio]         = useState(initialBio);
  const [avatarUrl,   setAvatarUrl]   = useState(initialAvatarUrl);
  const [countryCode, setCountryCode] = useState(initialCountryCode);

  const { updateProfile, loading, error, success } = useUpdateProfile();

  const handleSave = async () => {
    const updated = await updateProfile({
      full_name: name, bio, avatar_url: avatarUrl, country_code: countryCode,
    });
    if (updated) onUpdated?.(updated);
  };

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      gap:           22,
    }}>
      {/* ── Avatar ────────────────────────────────────────────── */}
      <AvatarUpload currentUrl={avatarUrl} name={name} onChange={setAvatarUrl} />

      {/* ── Name ──────────────────────────────────────────────── */}
      <Field label="Name">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={80}
          placeholder="Your name"
          style={inputStyle}
        />
      </Field>

      {/* ── About ─────────────────────────────────────────────── */}
      <Field label="About you">
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="A line about you — programme, interests, what you're into…"
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
        />
      </Field>

      {/* ── Nationality ───────────────────────────────────────── */}
      <Field label="Nationality">
        <div style={{ position: 'relative' }}>
          {/* Flag preview */}
          <span style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 18, pointerEvents: 'none', lineHeight: 1,
          }}>
            {countryCode
              ? (COUNTRIES.find(c => c.code === countryCode)?.flag ?? '🌍')
              : '🌍'
            }
          </span>
          <select
            value={countryCode}
            onChange={e => setCountryCode(e.target.value)}
            style={{
              ...inputStyle,
              paddingLeft: 44,
              paddingRight: 36,
              appearance: 'none',
              WebkitAppearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select country…</option>
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <span style={{
            position: 'absolute', right: 14, top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'var(--text-muted)',
            fontSize: 11, lineHeight: 1,
          }}>
            ▾
          </span>
        </div>
      </Field>

      {/* ── Feedback ──────────────────────────────────────────── */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 12,
          background: 'var(--status-error-bg)',
          border: '1px solid var(--status-error-border)',
          color: 'var(--status-error-text)',
          fontSize: 13, fontWeight: 500, textAlign: 'center',
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          padding: '12px 16px', borderRadius: 12,
          background: 'var(--status-success-bg)',
          border: '1px solid var(--status-success-border)',
          color: 'var(--status-success-text)',
          fontSize: 13, fontWeight: 600, textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Check size={14} strokeWidth={2} /> Profile updated
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={loading || !name.trim()}
        className="btn btn-primary btn-block"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        {loading ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}

/* ─── Shared input style — dark-theme, high contrast ────────── */
/*
  FIX #3 — Edit Profile illeggibile:
  Le classi originali usavano bg-gray-50, border-gray-200, text-gray-500
  che sono colori light-mode (#f9fafb, #e5e7eb, #6b7280) — invisibili
  su --bg-base: #080810.
  Sostituiti con CSS vars del design system dark:
  - background: var(--bg-elevated)  = #181828
  - border: var(--border-subtle)    = rgba(255,255,255,0.055)
  - color: var(--text-primary)      = #EEEEFF  ← LEGGIBILE
  - placeholder: var(--text-muted)  = #44445A  ← visibile senza distrarre
  - focus: brand-primary + glow     = accessibilità WCAG AA
*/
const inputStyle: React.CSSProperties = {
  width:        '100%',
  background:   'var(--bg-elevated)',
  border:       '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  color:        'var(--text-primary)',         /* #EEEEFF — alta leggibilità */
  fontSize:     15,
  padding:      '13px 14px',
  outline:      'none',
  fontFamily:   'var(--font-body)',
  transition:   'border-color 0.18s ease, box-shadow 0.18s ease',
  boxSizing:    'border-box',
  /* placeholder color via CSS injection below */
};

/* ─── Field wrapper ──────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display:       'block',
        fontSize:      13,
        fontWeight:    600,
        color:         'var(--text-secondary)',
        marginBottom:  8,
        letterSpacing: '-0.01em',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}
