'use client';

import { useState } from 'react';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';

interface Props {
  initialName: string;
  initialBio: string;
  initialAvatarUrl: string;
  onUpdated?: (user: { full_name: string; bio: string; avatar_url: string }) => void;
}

export function ProfileForm({
  initialName,
  initialBio,
  initialAvatarUrl,
  onUpdated,
}: Props) {
  const [fullName, setFullName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const { updateProfile, loading, error, success } = useUpdateProfile();

  const handleSubmit = async () => {
    const updated = await updateProfile({ 
      full_name: fullName, 
      bio, 
      avatar_url: avatarUrl 
    });
    if (updated) onUpdated?.(updated);
  };

  const avatarPreview = avatarUrl ? avatarUrl : null;

  return (
    <div className="flex flex-col gap-5 max-w-md">
      {/* Avatar preview + input URL */}
      <div className="flex items-center gap-4">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-semibold text-gray-600">
            {fullName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            URL immagine profilo
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Nome */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Nome visualizzato *
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={80}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Bio <span className="text-gray-400 font-normal">(max 300 caratteri)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Raccontati in breve..."
        />
        <p className="text-xs text-gray-400 text-right mt-0.5">{bio.length}/300</p>
      </div>

      {/* Feedback */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">✓ Profilo aggiornato</p>}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !fullName.trim()}
        className="self-start bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
      >
        {loading ? 'Salvataggio...' : 'Salva modifiche'}
      </button>
    </div>
  );
}
