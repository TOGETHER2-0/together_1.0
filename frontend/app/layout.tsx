import type { Metadata, Viewport } from 'next';
import RootLayoutClient from './layout-client';
import './globals.css';

export const metadata: Metadata = {
  title: 'Together',
  description: 'JU Student Events',
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
    <html lang="en">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
