'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { Event } from '@/lib/types';
import { getLocationByName } from '@/lib/locations';

interface Props {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (event: Event) => void;
}

export function EventEditDrawer({ event, isOpen, onClose, onUpdated }: Props) {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDatetime, setEventDatetime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [locationText, setLocationText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    } else {
      setReady(false);
      const t = setTimeout(() => setVisible(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setTitle(event.title);
    setDescription(event.description || '');
    setEventDatetime(toLocalDatetimeInput(event.event_datetime));
    setMaxParticipants(
      event.max_participants !== null && event.max_participants !== undefined
        ? String(event.max_participants)
        : '',
    );

    setLocationText(event.location_text || '');
  }, [isOpen, event]);

  async function handleSave() {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!eventDatetime) { setError('Date and time are required.'); return; }
    if (!locationText.trim()) { setError('Location is required.'); return; }

    const parsedMaxParticipants = maxParticipants.trim()
      ? parseInt(maxParticipants, 10)
      : null;
    if (parsedMaxParticipants !== null && Number.isNaN(parsedMaxParticipants)) {
      setError('Max participants must be a number.');
      return;
    }

    const preset = getLocationByName(locationText.trim());
    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      event_datetime: new Date(eventDatetime).toISOString(),
      location_text: locationText.trim(),
      latitude: preset?.latitude ?? null,
      longitude: preset?.longitude ?? null,
      max_participants: parsedMaxParticipants,
    };

    setLoading(true);
    try {
      const updated: any = await eventsApi.update(event.id, payload);
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string' ? detail
          : Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ')
            : 'Failed to update event. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 49,
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.28s ease',
        }}
      />

      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-base)',
        transform: ready ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
          background: 'var(--bg-base)',
        }}>
          <button
            onClick={onClose}
            aria-label="Close edit"
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.09em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: 2,
            }}>
              Edit Event
            </p>
            <h3 style={{
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}>
              {event.title}
            </h3>
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px 16px 24px',
          WebkitOverflowScrolling: 'touch',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Event title *</label>
              <input
                className="input-field"
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); if (error) setError(''); }}
                maxLength={80}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="input-field"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                style={{ resize: 'none', lineHeight: 1.6 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date & time *</label>
              <input
                className="input-field"
                type="datetime-local"
                value={eventDatetime}
                onChange={e => { setEventDatetime(e.target.value); if (error) setError(''); }}
                min={new Date().toISOString().slice(0, 16)}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Ekhagen, Vindlovsgatan 12, JIBS Campus"
                value={locationText}
                onChange={e => { setLocationText(e.target.value); if (error) setError(''); }}
                maxLength={255}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Max participants{' '}
                <span style={{
                  color: 'var(--text-muted)',
                  fontWeight: 400,
                  textTransform: 'none',
                  letterSpacing: 0,
                }}>
                  (optional)
                </span>
              </label>
              <input
                className="input-field"
                type="number"
                placeholder="Leave empty for unlimited"
                value={maxParticipants}
                onChange={e => setMaxParticipants(e.target.value)}
                min={1}
                max={500}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(251,113,133,0.10)',
                border: '1px solid rgba(251,113,133,0.28)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: '#FB7185',
                fontSize: 13.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 500,
              }}>
                <AlertCircle size={15} strokeWidth={1.75} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}
          </div>
        </div>

        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          flexShrink: 0,
          background: 'var(--bg-base)',
        }}>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="spinner spinner-sm" />
                Saving...
              </span>
            ) : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  );
}

function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
