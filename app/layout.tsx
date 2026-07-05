// @ts-ignore
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ITSM Ticketing System',
  description: 'A modern single-folder ITSM ticketing experience built with Next.js and Supabase.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}