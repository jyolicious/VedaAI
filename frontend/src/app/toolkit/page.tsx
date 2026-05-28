"use client";

import { useState } from 'react';

export default function ToolkitPage() {
  const [prompt, setPrompt] = useState('Generate a rubric for a 10-mark algebra test');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function runTool(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/toolkit/rubric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Tool failed');
      setResult(data.data || data.result || JSON.stringify(data));
    } catch (err: any) {
      setResult(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">AI Teacher's Toolkit</h2>
      <form onSubmit={runTool} className="space-y-3">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full p-2 border rounded" rows={4} />
        <div>
          <button className="px-4 py-2 bg-orange-500 text-white rounded">Run</button>
        </div>
      </form>

      <div className="mt-4 bg-white p-4 rounded shadow">
        <h3 className="font-medium">Result</h3>
        <pre className="whitespace-pre-wrap mt-2 text-sm">{loading ? 'Running…' : result}</pre>
      </div>
    </div>
  );
}
