'use client';

import { usePathname } from 'next/navigation';
import Header from '../components/layout/Header';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define route prefixes that use the Sidebar Layout
  const isDashboardPage = 
    pathname.startsWith('/assignments') || 
    pathname.startsWith('/toolkit') || 
    pathname.startsWith('/library');

  return (
    <html lang="en">
      <head>
        <title>VedaAI</title>
        <meta name="description" content="AI-powered assignment creation and grading" />
      </head>
      <body className="min-h-screen bg-slate-50/50 antialiased">
        {/* Render the global Header ONLY if we are NOT on a sidebar layout page */}
        {!isDashboardPage && <Header />}
        
        {/* 
          If it's a dashboard page, remove max-width containers completely 
          so the sidebar has full room to fill the browser viewport.
        */}
        <main className={isDashboardPage ? "w-full" : "mx-auto max-w-6xl px-4 py-8"}>
          {children}
        </main>
      </body>
    </html>
  );
}