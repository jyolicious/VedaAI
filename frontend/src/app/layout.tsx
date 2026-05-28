import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/layout/Header';

export const metadata: Metadata = {
  title: 'VedaAI',
  description: 'AI-powered assignment creation and grading',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
