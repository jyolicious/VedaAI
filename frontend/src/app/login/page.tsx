"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid email or password.');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('schoolName', data.user.schoolName || '');
      
      // notify other components that auth changed so header updates immediately
      window.dispatchEvent(new Event('auth:changed'));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md">
        
        {/* Branding Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-1.5 text-3xl font-black text-gray-950 tracking-tight mb-2">
            <span>Veda</span><span className="text-orange-500">AI</span>
          </Link>
          <p className="text-sm text-gray-500">Welcome back! Please sign in to your dashboard locker.</p>
        </div>

        {/* Core Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xl shadow-gray-100/40">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Account Login</h2>
          
          {/* Enhanced Alert Banner Container */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2 text-red-700 text-sm animate-fade-in">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            
            {/* Field Block: Email */}
            <div>
              <label htmlFor="email-field" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input 
                id="email-field"
                type="email"
                autoComplete="email"
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@school.com" 
                className="w-full h-11 px-4 text-sm text-gray-800 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all duration-200"
                disabled={loading}
              />
            </div>

            {/* Field Block: Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password-field" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input 
                  id="password-field"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full h-11 pl-4 pr-11 text-sm text-gray-800 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all duration-200"
                  disabled={loading}
                />
                {/* Visual Eye Toggler Button Control */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Action Group Footer */}
            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-11 flex justify-center items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.99] transition-all duration-150 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Core Footer Link Redirections */}
          <div className="mt-6 text-center text-sm border-t border-gray-100 pt-5">
            <span className="text-gray-400">Don't have an account? </span>
            <Link href="/signup" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              Create an account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}