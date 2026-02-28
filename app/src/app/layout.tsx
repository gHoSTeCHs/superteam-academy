import type { Metadata } from 'next';
import { archivo, inter } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Superteam Academy',
  description: 'Learn Solana development with interactive courses, coding challenges, and on-chain credentials.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${archivo.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
