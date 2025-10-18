import type { Metadata } from 'next';
import { Alegreya } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const alegreya = Alegreya({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'PeriBloom',
  description: 'Your trusted partner in motherhood.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased', alegreya.variable)}>
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
