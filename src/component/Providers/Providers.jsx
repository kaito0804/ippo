//src/component/Providers/Providers.jsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { LiffProvider } from '@/component/Line/Line';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <LiffProvider>
        {children}
      </LiffProvider>
    </SessionProvider>
  );
}