'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './Toast';

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
