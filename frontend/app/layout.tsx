import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import RootLayoutClient from './layout-client';
import './globals.css';

export const metadata: Metadata = {
  title: 'Together — Jönköping University',
  description: 'Connect with students and explore events at JU',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
