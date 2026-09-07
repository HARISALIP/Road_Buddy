import type { Metadata, Viewport } from 'next';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';
import InstallPromptBanner from '@/components/pwa/InstallPromptBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Road Buddy Finance - Modern Partnership Expense Management',
  description: 'Clean financial and expense tracking system for partnership businesses in Saudi Arabia.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Road Buddy',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Road Buddy" />
        <meta name="apple-mobile-web-app-title" content="Road Buddy" />
        <meta name="msapplication-starturl" content="/" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        <ServiceWorkerRegister />
        {children}
        <InstallPromptBanner />
      </body>
    </html>
  );
}
