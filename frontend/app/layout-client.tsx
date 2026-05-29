'use client';

import { useEffect } from 'react';
import { hydrateAuth } from '@/lib/store';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateAuth();
  }, []);

  return <>{children}</>;
}
