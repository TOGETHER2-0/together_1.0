'use client';

import { useState } from 'react';
import { profileApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export interface ProfileFields {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  country_code?: string;
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setAuth, token, user } = useAuthStore();

  const updateProfile = async (fields: ProfileFields) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updated: any = await profileApi.update(fields);
      // Aggiorna lo store mantenendo il token esistente
      setAuth(token!, { ...user!, ...updated });
      setSuccess(true);
      return updated;
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string' ? detail
        : Array.isArray(detail)   ? detail.map((d: any) => d.msg).join(', ')
        : 'Errore aggiornamento profilo'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error, success };
}
