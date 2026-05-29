'use client';

import { useState } from 'react';
import { AvatarUpload } from './AvatarUpload';
import { COUNTRIES } from '@/lib/countries';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';

interface Props {
  initialName: string;
  initialBio: string;
  initialAvatarUrl: string;
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
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [countryCode, setCountryCode] = useState(initialCountryCode);

  const { updateProfile, loading, error, success } = useUpdateProfile();

  const handleSave = async () => {
    const updated = await updateProfile({ full_name: name, bio, avatar_url: avatarUrl, country_code: countryCode });
    if (updated) onUpdated?.(updated);
  };

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto pb-10">
      {/* Avatar */}
      <AvatarUpload currentUrl={avatarUrl} name={name} onChange={setAvatarUrl} />

      {/* Nome */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Nome visualizzato
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Raccontati in breve..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/300</p>
      </div>

      {/* Nazionalità */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Nazionalità
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
            {countryCode ? COUNTRIES.find((c) => c.code === countryCode)?.flag ?? '🌍' : '🌍'}
          </span>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition"
          >
            <option value="">Seleziona paese...</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {success && <p className="text-green-600 text-sm text-center">✓ Profilo aggiornato</p>}

      {/* Submit */}
      <button
        onClick={handleSave}
        disabled={loading || !name.trim()}
        className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold shadow-sm transition"
      >
        {loading ? 'Salvataggio...' : 'Salva profilo'}
      </button>
    </div>
  );
}
