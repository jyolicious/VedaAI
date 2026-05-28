"use client";

import { useEffect, useState } from 'react';

type LibraryItem = { _id: string; title: string; createdAt?: string };

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/library', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      setItems(data.data || data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title || file.name);
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/library/upload', {
      method: 'POST',
      body: fd,
      headers: token ? { Authorization: `Bearer ${token}` } as any : undefined,
    });
    const d = await res.json();
    if (res.ok) {
      setFile(null);
      setTitle('');
      fetchItems();
    } else {
      alert(d.message || 'Upload failed');
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Library</h2>

      <form onSubmit={upload} className="mb-6 flex gap-2 items-center">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="p-2 border rounded" />
        <button className="px-3 py-1 bg-orange-500 text-white rounded">Upload</button>
      </form>

      <div className="grid gap-3">
        {items.map((it) => (
          <div key={it._id} className="p-3 bg-white rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{(it as any).title || 'Untitled'}</div>
                <div className="text-xs text-slate-500">{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</div>
              </div>
              <a className="text-sm text-orange-600" href={(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/library/download/' + it._id}>Download</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
