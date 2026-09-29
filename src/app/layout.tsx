import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EventHub — Find your next great night',
  description: 'Discover, save, and book unforgettable events.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
