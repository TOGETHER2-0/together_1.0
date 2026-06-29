'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface Props {
  currentUrl: string;
  name: string;
  onChange: (url: string) => void;
}

/* Downscale + recompress an image client-side before upload. Phone photos are
   several MB and hit the backend's 2MB cap (413). An avatar only ever renders
   tiny, so we cap the longest side at 512px and re-encode to JPEG — the result
   is a few tens of KB. Falls back to the original file if canvas is unavailable. */
async function downscaleImage(file: File, max = 512, quality = 0.85): Promise<Blob> {
  try {
    const dataUrl: string = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    const img: HTMLImageElement = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = dataUrl;
    });
    let { width, height } = img;
    if (width > max || height > max) {
      const scale = max / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
    return blob ?? file;
  } catch {
    return file;
  }
}

export function AvatarUpload({ currentUrl, name, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview]     = useState<string>(currentUrl);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    // Immediate local preview (base64)
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to backend. The /avatar endpoint requires the bearer token —
    // attach it here (raw fetch is kept so the browser sets the multipart
    // boundary itself). Without it the request 401s and the new avatar is
    // silently dropped.
    setUploading(true);
    try {
      // Shrink before upload so normal phone photos don't exceed the 2MB cap (413).
      const resized = await downscaleImage(file);
      const form = new FormData();
      form.append('file', resized, 'avatar.jpg');
      const token = typeof window !== 'undefined' ? localStorage.getItem('together-token') : null;
      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      const data = res.ok ? await res.json() : null;
      if (data?.url) {
        onChange(data.url);
      } else {
        setPreview(currentUrl);
        showToast('Could not upload that image. Please try again.', 'error');
      }
    } catch {
      setPreview(currentUrl);
      showToast('Could not upload that image. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const open = () => inputRef.current?.click();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Avatar — same face DNA as the rest of the app: circle, hairline ring */}
      <button
        type="button"
        onClick={open}
        aria-label="Change profile photo"
        className="pressable"
        style={{
          position: 'relative',
          width: 96, height: 96, borderRadius: '50%',
          background: 'var(--brand-primary)',
          border: '1px solid rgba(255,255,255,0.10)',
          overflow: 'hidden', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {preview ? (
          <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800,
            color: '#fff', letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            {name?.[0]?.toUpperCase() ?? '?'}
          </span>
        )}

        {/* Camera affordance — bottom-right badge */}
        <span style={{
          position: 'absolute', right: 2, bottom: 2,
          width: 30, height: 30, borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '2px solid var(--bg-base)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-primary)',
        }}>
          <Camera size={15} strokeWidth={1.9} />
        </span>

        {/* Uploading overlay — uses the shared spinner */}
        {uploading && (
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(9,9,26,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="spinner" />
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={open}
        disabled={uploading}
        style={{
          background: 'none', border: 'none', cursor: uploading ? 'default' : 'pointer',
          color: 'var(--brand-mid)', fontSize: 13, fontWeight: 600,
          fontFamily: 'var(--font-body)', padding: '4px 8px',
        }}
      >
        {uploading ? 'Uploading…' : 'Change photo'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset the input so re-selecting the SAME file fires onChange again
          // (otherwise a retry after a failed upload silently does nothing).
          e.target.value = '';
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
