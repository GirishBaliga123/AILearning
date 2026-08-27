import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/layout/Providers';
import AuthAppShell from '@/components/layout/AuthAppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'MyBillLedger - Expense Tracker',
  description: 'Track your monthly expenses, set budgets, and view spending reports.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>
          <AuthAppShell>{children}</AuthAppShell>
        </Providers>
      </body>
    </html>
  );
}
