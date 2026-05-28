"use client";

"use client";

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [stats, setStats] = useState<{ assignments: number; papers: number }>({ assignments: 0, papers: 0 });

  useEffect(() => {
    // fetch lightweight analytics from backend
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/health')
      .then((r) => r.json())
      .then(() => {
        // Placeholder: count endpoints may be added later; for now show sample numbers
        setStats({ assignments: 12, papers: 34 });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Welcome to VedaAI</h1>
      <p className="text-slate-600 mb-6">AI-powered question paper generation and teacher toolkit.</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-slate-500">Assignments</h3>
          <p className="text-2xl font-semibold">{stats.assignments}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-slate-500">Question Papers Generated</h3>
          <p className="text-2xl font-semibold">{stats.papers}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-slate-500">Your School</h3>
          <p className="text-2xl font-semibold">{localStorage.getItem('schoolName') || 'Your School'}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <a href="/assignments" className="p-6 bg-white rounded shadow hover:shadow-md">Go to Assignments</a>
        <a href="/library" className="p-6 bg-white rounded shadow hover:shadow-md">My Library</a>
        <a href="/toolkit" className="p-6 bg-white rounded shadow hover:shadow-md">AI Teacher's Toolkit</a>
      </div>
    </div>
  );
}