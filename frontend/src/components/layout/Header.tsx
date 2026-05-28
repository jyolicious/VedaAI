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
          <Link href="/" className="text-lg font-semibold text-orange-600">VedaAI</Link>
          <nav className="hidden sm:flex gap-3">
            <Link href="/" className="text-sm text-slate-700">Home</Link>
            <Link href="/assignments" className="text-sm text-slate-700">Assignments</Link>
            <Link href="/library" className="text-sm text-slate-700">My Library</Link>
            <Link href="/toolkit" className="text-sm text-slate-700">AI Toolkit</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>

          {token ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600">{userName ? userName.charAt(0).toUpperCase() : 'U'}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{userName || 'User'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-slate-600">Login</Link>
              <Link href="/signup" className="px-3 py-1 bg-orange-500 text-white rounded text-sm">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
