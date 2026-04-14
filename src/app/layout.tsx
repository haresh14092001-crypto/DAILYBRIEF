import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Intelligence OS',
  description: 'A dedicated operating system for vets, founders, and learners.',
  themeColor: '#059669',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`antialiased bg-background text-foreground min-h-[100dvh] pb-safe flex flex-col`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
