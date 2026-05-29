'use client';

import { useRef, useState } from 'react';

interface Props {
  currentUrl: string;
  name: string;
  onChange: (url: string) => void;
}

export function AvatarUpload({ currentUrl, name, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(currentUrl);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    // Preview immediata locale (base64)
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload al backend con base64
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/users/avatar', { method: 'POST', body: form });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } catch {
      console.error('Upload fallito');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group w-fit mx-auto">
      {/* Avatar circle */}
      <div
        className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-xl cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-4xl text-white font-bold">
            {name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      {/* Overlay hover */}
      <div
        className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <span className="text-white text-xs font-medium">
          {uploading ? '...' : 'Cambia'}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
