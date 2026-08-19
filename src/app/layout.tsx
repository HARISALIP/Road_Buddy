import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Road Buddy Finance - Modern Partnership Expense Management',
  description: 'Clean financial and expense tracking system for partnership businesses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
