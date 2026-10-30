import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Sans, Fraunces } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Divide It — Friendly division practice',
  description:
    'A clear, encouraging division calculator for building confidence with every problem.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
