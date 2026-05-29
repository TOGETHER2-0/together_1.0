'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { eventsApi } from '@/lib/api';
import { LOCATIONS, CATEGORY_LABELS, getLocationById } from '@/lib/locations';

type Category = 'accommodation' | 'bar' | 'campus' | 'outdoor' | 'other';

const CAT_ORDER: Category[] = ['accommodation', 'campus', 'bar', 'outdoor', 'other'];

const CAT_STYLE: Record<Category, { color: string; icon: string }> = {
  accommodation: { color: '#FFB547', icon: '🏠' },
  bar:           { color: '#FF5E7D', icon: '🍺' },
  campus:        { color: '#7C5CFC', icon: '🎓' },
  outdoor:       { color: '#00E5B3', icon: '🌿' },
  other:         { color: '#60AAFF', icon: '📍' },
};

const GROUPED = LOCATIONS.reduce<Record<string, typeof LOCATIONS>>((acc, loc) => {
  if (!acc[loc.category]) acc[loc.category] = [];
  acc[loc.category].push(loc);
  return acc;
}, {});

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    event_datetime: '',
    location_id: '',
    max_participants: '',
  });

  const selected = form.location_id ? getLocationById(form.location_id) : null;
  const catStyle = selected ? CAT_STYLE[selected.category as Category] || CAT_STYLE.other : null;

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (error) setError('');
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) { setError('Please select a location.'); return; }
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        event_datetime: new Date(form.event_datetime).toISOString(),
        location_text: selected.name,
        latitude: selected.latitude,
        longitude: selected.longitude,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      };
      const created = await eventsApi.create(payload);
      router.push(`/events/${created.id}`);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string' ? detail
        : Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ')
        : 'Failed to create event. Try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const isValid = form.title.trim() && form.event_datetime && form.location_id;
  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <AppLayout>
      <div style={{ padding: '52px 20px 32px' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 28,
        }}>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => router.back()}
            style={{ fontSize: 18 }}
          >
            ←
          </button>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.035em',
            }}>
              New Event
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 1 }}>
              Bring people together
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title */}
          <div className="form-group animate-fade-up">
            <label className="form-label">Event title *</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. Pre-game at Ekhagen"
              value={form.title}
              onChange={set('title')}
              required
              maxLength={80}
            />
          </div>

          {/* Description */}
          <div className="form-group animate-fade-up stagger-1">
            <label className="form-label">Description</label>
            <textarea
              className="input-field"
              placeholder="What's happening? Who should come? Any details…"
              value={form.description}
              onChange={set('description') as any}
              rows={4}
              style={{ resize: 'none', lineHeight: 1.6 }}
            />
          </div>

          {/* Date & time */}
          <div className="form-group animate-fade-up stagger-1">
            <label className="form-label">Date & time *</label>
            <input
              className="input-field"
              type="datetime-local"
              value={form.event_datetime}
              onChange={set('event_datetime')}
              min={minDate}
              required
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Location */}
          <div className="form-group animate-fade-up stagger-2">
            <label className="form-label">Location *</label>
            <div className="select-wrapper">
              <select
                className="input-field"
                value={form.location_id}
                onChange={set('location_id')}
                required
                style={{ cursor: 'pointer' }}
              >
                <option value="" disabled>Choose a location…</option>
                {CAT_ORDER.map(cat => {
                  const locs = GROUPED[cat];
                  if (!locs?.length) return null;
                  const catIcon = CAT_STYLE[cat]?.icon || '📍';
                  return (
                    <optgroup key={cat} label={`${catIcon} ${CATEGORY_LABELS[cat]}`}>
                      {locs.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}{loc.address ? ` — ${loc.address}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {/* Location preview card */}
            {selected && catStyle && (
              <div className="animate-scale-in" style={{
                background: `${catStyle.color}0D`,
                border: `1px solid ${catStyle.color}28`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 38, height: 38,
                  background: `${catStyle.color}1A`,
                  border: `1px solid ${catStyle.color}30`,
                  borderRadius: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {catStyle.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {selected.name}
                  </div>
                  {selected.address && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      📌 {selected.address}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: 11,
                  color: catStyle.color,
                  background: `${catStyle.color}15`,
                  border: `1px solid ${catStyle.color}25`,
                  borderRadius: 999,
                  padding: '3px 9px',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}>
                  On map ✓
                </div>
              </div>
            )}
          </div>

          {/* Max participants */}
          <div className="form-group animate-fade-up stagger-3">
            <label className="form-label">
              Max participants{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                (optional)
              </span>
            </label>
            <input
              className="input-field"
              type="number"
              placeholder="Leave empty for unlimited"
              value={form.max_participants}
              onChange={set('max_participants')}
              min={1}
              max={500}
            />
          </div>

          {/* Error */}
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

          {/* Preview */}
          {isValid && selected && catStyle && (
            <div className="animate-scale-in" style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 2.5,
                background: `linear-gradient(90deg, ${catStyle.color}, ${catStyle.color}60)`,
              }} />
              <p className="section-label" style={{ marginBottom: 10 }}>Preview</p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: '-0.03em',
                marginBottom: 6,
              }}>
                {form.title}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                {catStyle.icon} {selected.name}
                {form.event_datetime && (
                  <> · 📅 {new Date(form.event_datetime).toLocaleDateString('en', {
                    weekday: 'short', day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}</>
                )}
                {form.max_participants && (
                  <> · 👥 {form.max_participants} max</>
                )}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading || !isValid}
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="spinner spinner-sm" />
                Creating…
              </span>
            ) : '✨ Create event'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}