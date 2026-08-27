'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import AppShell from './AppShell';

export default function AuthAppShell({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith('/auth/');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AppShell userName={session?.user?.name} onLogout={() => signOut()}>
      {children}
    </AppShell>
  );
}
