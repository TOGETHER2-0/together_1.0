'use client';

import { useState, useEffect } from 'react';
import { Compass, UserPlus, CheckCircle, MessageSquare } from 'lucide-react';

const STORAGE_KEY = 'together-onboarding-v1';

const STEPS = [
  {
    Icon: Compass,
    title: 'Browse events',
    body: 'Events are posted by other JU students. Search by name, place, or date to find one.',
  },
  {
    Icon: UserPlus,
    title: 'Request to join',
    body: 'Send a join request on any event. The host decides who is approved.',
  },
  {
    Icon: CheckCircle,
    title: 'Get approved',
    body: 'Once the host approves you, you gain access to the event and its coordination chat.',
  },
  {
    Icon: MessageSquare,
    title: 'Coordinate',
    body: 'Use the event chat to sort out time, place, and details. Or host your own event.',
  },
];

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.72)',
        }}
      />

      {/* Sheet — centered via margin auto (the slideUp animation only drives
          translateY, so translateX centering must not live on transform) */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        margin: '0 auto',
        width: '100%', maxWidth: 430,
        zIndex: 301,
        background: 'var(--bg-surface)',
        borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border-medium)',
        borderBottom: 'none',
        boxShadow: 'var(--shadow-sheet)',
        padding: '28px 28px calc(env(safe-area-inset-bottom, 0px) + 28px)',
        animation: 'slideUp 0.32s cubic-bezier(0.32, 0.72, 0, 1) both',
      }}>
        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 18 : 6,
              height: 6, borderRadius: 3,
              background: i === step ? 'var(--brand-primary)' : 'var(--border-medium)',
              transition: 'all 0.25s ease',
            }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            margin: '0 auto 18px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--brand-primary)',
          }}>
            <current.Icon size={24} strokeWidth={1.75} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22, fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: 10,
          }}>
            {current.title}
          </h2>
          <p style={{
            fontSize: 15, color: 'var(--text-secondary)',
            lineHeight: 1.6, maxWidth: 280, margin: '0 auto',
          }}>
            {current.body}
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={next}
          className="btn btn-primary btn-block"
          style={{ marginBottom: 12 }}
        >
          {isLast ? 'Get started' : 'Next'}
        </button>

        <button
          onClick={dismiss}
          style={{
            width: '100%', background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', padding: '8px 0', fontFamily: 'var(--font-body)',
          }}
        >
          Skip
        </button>
      </div>
    </>
  );
}
