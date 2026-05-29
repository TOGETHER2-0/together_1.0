'use client';

import { countryCodeToFlag } from '@/lib/countries';

interface Props {
  name: string;
  bio?: string;
  avatarUrl?: string;
  countryCode?: string;
  email?: string;
}

export function ProfileCard({ name, bio, avatarUrl, countryCode, email }: Props) {
  const flag = countryCode ? countryCodeToFlag(countryCode) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cover gradient */}
      <div className="h-24 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

      <div className="px-5 pb-5">
        {/* Avatar sovrapposto */}
        <div className="-mt-12 mb-3">
          <div className="w-20 h-20 rounded-full ring-4 ring-white overflow-hidden shadow-lg">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-3xl text-white font-bold">
                {name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Nome + bandiera */}
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{name}</h2>
          {flag && <span className="text-xl">{flag}</span>}
        </div>

        {email && <p className="text-xs text-gray-400 mb-2">{email}</p>}

        {bio && <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>}
      </div>
    </div>
  );
}
