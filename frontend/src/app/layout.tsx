import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VedaAI',
  description: 'AI-powered assignment creation and grading',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="text-xl font-semibold text-orange-600">VedaAI</a>
              <nav className="flex gap-3">
                <a href="/" className="text-sm text-slate-700">Home</a>
                <a href="/assignments" className="text-sm text-slate-700">Assignments</a>
                <a href="/library" className="text-sm text-slate-700">My Library</a>
                <a href="/toolkit" className="text-sm text-slate-700">AI Toolkit</a>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <a href="/login" className="text-sm text-slate-600">Login</a>
              <a href="/signup" className="px-3 py-1 bg-orange-500 text-white rounded text-sm">Sign up</a>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
