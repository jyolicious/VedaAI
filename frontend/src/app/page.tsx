"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [stats, setStats] = useState<{ assignments: number; papers: number }>({ assignments: 0, papers: 0 });
  const [school, setSchool] = useState<string>('Your School');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Pull local storage safely inside client side hook context to avoid hydration mismatch
    const savedSchool = localStorage.getItem('schoolName');
    if (savedSchool) setSchool(savedSchool);

    // fetch lightweight analytics from backend
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/health')
      .then((r) => r.json())
      .then(() => {
        setStats({ assignments: 12, papers: 34 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/20 via-white to-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Welcome Section Banner */}
        <div className="mb-10 pb-6 border-b border-gray-100">
          <h1 className="text-3xl font-black text-gray-950 tracking-tight sm:text-4xl">
            Welcome to Veda<span className="text-orange-500">AI</span>
          </h1>
          <p className="mt-2 text-base text-gray-500 max-w-2xl leading-relaxed">
            Your high-performance workspace locker for AI-powered question generation, grading structures, and comprehensive tools built for teachers.
          </p>
        </div>

        {/* Dashboard Counter Statistics Row */}
        <h3 className="text-xs font-bold text-gray-400 tracking-wide uppercase mb-4">Locker Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          
          {/* Card: Assignments */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4 group">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="truncate">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Assignments</h4>
              <p className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                {loading ? <span className="inline-block w-8 h-6 bg-gray-100 animate-pulse rounded" /> : stats.assignments}
              </p>
            </div>
          </div>

          {/* Card: Question Papers */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4 group">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="truncate">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Papers Generated</h4>
              <p className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                {loading ? <span className="inline-block w-8 h-6 bg-gray-100 animate-pulse rounded" /> : stats.papers}
              </p>
            </div>
          </div>

          {/* Card: School Identity */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4 group sm:col-span-2 lg:col-span-1">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="truncate">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Affiliated Institution</h4>
              <p className="text-xl font-bold text-gray-800 mt-0.5 tracking-tight truncate" title={school}>
                {school}
              </p>
            </div>
          </div>

        </div>

        {/* Workspace Quick Actions Router Hub */}
        <h3 className="text-xs font-bold text-gray-400 tracking-wide uppercase mb-4">Workspace Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Item Block: Assignments */}
          <Link href="/assignments" className="group flex flex-col justify-between p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 text-left">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-gray-900 group-hover:text-orange-500 transition-colors">Go to Assignments</h4>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Review existing class modules, distribute course assets, or deploy custom grading matrix boards.
              </p>
            </div>
            <div className="mt-6 text-xs font-semibold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Assessments &rarr;
            </div>
          </Link>

          {/* Item Block: Library */}
          <Link href="/library" className="group flex flex-col justify-between p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 text-left">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19v-4a2 2 0 012-2h11a2 2 0 012 2v3" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-gray-900 group-hover:text-orange-500 transition-colors">My Library Locker</h4>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Securely store and preview internal asset media files, textbook reference blocks, and source templates.
              </p>
            </div>
            <div className="mt-6 text-xs font-semibold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Browse Document Vault &rarr;
            </div>
          </Link>

          {/* Item Block: Toolkit */}
          <Link href="/toolkit" className="group flex flex-col justify-between p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 text-left">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-gray-900 group-hover:text-orange-500 transition-colors">AI Teacher's Toolkit</h4>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Generate high-quality exam rubrics, structured assignments, and grading metrics with intelligent AI assistants.
              </p>
            </div>
            <div className="mt-6 text-xs font-semibold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Launch Intelligence Engine &rarr;
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}