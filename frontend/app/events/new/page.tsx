'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, MapPin, ArrowLeft } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { eventsApi } from '@/lib/api';
import { getLocationByName } from '@/lib/locations';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    title:            '',
    description:      '',
    event_datetime:   '',
    location_text:    '',
    max_participants: '',
  });

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (error) setError('');
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.event_datetime) { setError('Date and time are required.'); return; }
    if (!form.location_text.trim()) { setError('Location is required.'); return; }

    const maxParticipants = form.max_participants.trim()
      ? parseInt(form.max_participants, 10)
      : null;
    if (maxParticipants !== null && Number.isNaN(maxParticipants)) {
      setError('Max participants must be a number.');
      return;
    }

    // Resolve coordinates from known presets; fall back to null
    const preset = getLocationByName(form.location_text.trim());
    const latitude  = preset?.latitude  ?? null;
    const longitude = preset?.longitude ?? null;

    setLoading(true);
    try {
      const payload: any = {
        title:            form.title.trim(),
        description:      form.description.trim(),
        event_datetime:   new Date(form.event_datetime).toISOString(),
        location_text:    form.location_text.trim(),
        latitude,
        longitude,
        max_participants: maxParticipants,
      };
      const created: any = await eventsApi.create(payload);
      router.push(`/events/${created.id}?created=1`);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'  ? detail
        : Array.isArray(detail)     ? detail.map((d: any) => d.msg).join(', ')
        : 'Failed to create event. Try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const isValid = form.title.trim() && form.event_datetime && form.location_text.trim();
  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <AppShell>
      <div style={{ padding: '20px 20px 40px' }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 40, height: 40,
              borderRadius: 14,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-primary)',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24, fontWeight: 800,
              letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
            }}>
              New Event
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
              Post an event for other students to request
            </p>
          </div>
        </div>

        {/* ── Form ───────────────────────────────────────────── */}
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

          {/* Location — text + Google Maps lookup */}
          <div className="form-group animate-fade-up stagger-2">
            <label className="form-label">Location *</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Ekhagen, Vindlovsgatan 12, JIBS Campus"
                value={form.location_text}
                onChange={set('location_text')}
                required
                maxLength={255}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.location_text.trim() || 'Jönköping')}`,
                  '_blank', 'noopener'
                )}
                aria-label="Find on Google Maps"
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0 14px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.30)',
                  color: 'var(--brand-mid)', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
                }}
              >
                <MapPin size={15} strokeWidth={2} />Maps
              </button>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>
              Tap Maps to find the exact spot — guests can open it in Google Maps from the event.
            </p>
          </div>

          {/* Max participants */}
          <div className="form-group animate-fade-up stagger-3">
            <label className="form-label">
              Max participants{' '}
              <span style={{
                color: 'var(--text-muted)', fontWeight: 400,
                textTransform: 'none', letterSpacing: 0,
              }}>
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
              background: 'rgba(251,113,133,0.10)',
              border: '1px solid rgba(251,113,133,0.28)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: '#FB7185', fontSize: 13.5,
              display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500,
            }}>
              <AlertCircle size={15} strokeWidth={1.75} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {/* Preview card */}
          {isValid && (
            <div className="animate-scale-in" style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2.5,
                background: 'var(--brand-gradient)',
              }} />
              <p className="section-label" style={{ marginBottom: 10 }}>Preview</p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800, fontSize: 17,
                letterSpacing: '-0.03em', marginBottom: 6,
                color: 'var(--text-primary)',
              }}>
                {form.title}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                {form.location_text}
                {form.event_datetime && (
                  <> · {new Date(form.event_datetime).toLocaleDateString('en', {
                    weekday: 'short', day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}</>
                )}
                {form.max_participants ? <> · {form.max_participants} max</> : <> · Unlimited</>}
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
            ) : 'Create event'}
          </button>

        </form>
      </div>
    </AppShell>
  );
}
