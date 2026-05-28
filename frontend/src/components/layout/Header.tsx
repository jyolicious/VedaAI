"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [userName, setUserName] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const read = () => {
      const t = localStorage.getItem('token');
      const u = localStorage.getItem('userName');
      const s = localStorage.getItem('schoolName');
      setToken(t);
      setUserName(u);
      setSchoolName(s);
    };

    read();
    const onAuth = () => read();
    window.addEventListener('auth:changed', onAuth);
    return () => window.removeEventListener('auth:changed', onAuth);
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('schoolName');
    setToken(null);
    setUserName(null);
    setSchoolName(null);
    window.dispatchEvent(new Event('auth:changed'));
    router.push('/login');
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-semibold text-orange-600">VedaAI</Link>
          <nav className="flex gap-3">
            <Link href="/" className="text-sm text-slate-700">Home</Link>
            <Link href="/assignments" className="text-sm text-slate-700">Assignments</Link>
            <Link href="/library" className="text-sm text-slate-700">My Library</Link>
            <Link href="/toolkit" className="text-sm text-slate-700">AI Toolkit</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {token ? (
            <>
              <div className="text-sm text-slate-700 text-right">
                <div className="font-medium">{userName || 'User'}</div>
                <div className="text-xs text-slate-500">{schoolName || ''}</div>
              </div>
              <button onClick={handleLogout} className="px-3 py-1 bg-gray-100 text-slate-700 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-600">Login</Link>
              <Link href="/signup" className="px-3 py-1 bg-orange-500 text-white rounded text-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
