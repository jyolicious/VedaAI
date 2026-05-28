"use client";

import { useEffect, useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';

type LibraryItem = { 
  _id: string; 
  name?: string; 
  createdAt?: string; 
  filename?: string; 
  mimeType?: string; 
};

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

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
      const finalData = data.data || data || [];
      setItems(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    
    // Create FormData instance
    const fd = new FormData();
    fd.append('file', file);
    
    // CRITICAL FIX: Ensure the title string is never empty, defaults to clean filename if blank
    const activeTitle = title.trim() || file.name;
    // backend expects `name` field
    fd.append('name', activeTitle);

    try {
      const token = localStorage.getItem('token');
      
      // CRITICAL FIX: Construct header object cleanly. Do NOT add 'Content-Type'. 
      // Letting the browser automatically handle headers preserves the essential multipart/form-data boundary.
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/library/upload', {
        method: 'POST',
        body: fd,
        headers: headers, // Pass a standard clean headers object
      });
      
      const d = await res.json();
      if (res.ok) {
        setFile(null);
        setTitle('');
        fetchItems();
      } else {
        alert(d.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload network error:', err);
      alert('An error occurred during file upload.');
    } finally {
      setUploading(false);
    }
  }

  const getFileIcon = (titleStr: string) => {
    const ext = titleStr.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return (
        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (['pdf'].includes(ext || '')) {
      return (
        <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <SidebarLayout breadcrumb="Library">
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-white py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Section */}
        <div className="mb-10 pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Resource <span className="text-orange-500">Library</span>
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Upload, store, and access your teaching resources and assets anytime.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full self-start sm:self-center border border-orange-100">
                {items.length} {items.length === 1 ? 'Resource File' : 'Resource Files'} Available
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-300 mb-10">
          <h3 className="text-xs font-bold text-gray-700 tracking-wide uppercase mb-4">Add New Document</h3>
          
          <form onSubmit={upload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            
            {/* Styled File Target Input */}
            <div className="relative md:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Select Document</label>
              <div className="relative flex items-center justify-center w-full h-[46px] px-4 bg-gray-50 hover:bg-gray-100/70 border border-gray-300 border-dashed rounded-xl cursor-pointer transition-colors group">
                <input 
                  type="file" 
                  onChange={(e) => {
                    const chosen = e.target.files?.[0] ?? null;
                    setFile(chosen);
                    if (chosen && !title) {
                      // Instantly set fallback view visually in input field
                      setTitle(chosen.name.split('.')[0]); 
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-sm font-medium text-gray-600 truncate max-w-full">
                  {file ? file.name : "Choose or drag file..."}
                </span>
              </div>
            </div>

            {/* Document Alias Input */}
            <div className="md:col-span-1">
              <label htmlFor="title-field" className="block text-xs font-medium text-gray-500 mb-1.5">Document Title</label>
              <input 
                id="title-field"
                type="text"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Assign a title name..." 
                className="w-full h-[46px] px-4 text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>

            {/* Action Control Button */}
            <div className="md:col-span-1">
              <button 
                type="submit"
                disabled={!file || uploading}
                className="w-full h-[46px] flex justify-center items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.99] transition-all disabled:pointer-events-none cursor-pointer"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload File'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Resources Grid */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 tracking-wide uppercase mb-4">Saved Resources</h3>
          
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19v-4a2 2 0 012-2h11a2 2 0 012 2v3m-7-2h1m0 3h1m-5 2h5" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-gray-700">Library Empty</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">No teaching assets found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((it) => {
                // Ensure text rendering reads the database title correctly
                const cleanDisplayTitle = it.name || it.filename || 'Untitled Resource';
                const fileUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/library/download/' + it._id;
                
                return (
                  <div key={it._id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all group flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 truncate">
                      <div className="p-2.5 bg-gray-50 rounded-lg group-hover:bg-orange-50/50 transition-colors shrink-0">
                        {getFileIcon(cleanDisplayTitle)}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-sm text-gray-800 truncate group-hover:text-orange-600 transition-colors" title={cleanDisplayTitle}>
                          {cleanDisplayTitle}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {it.createdAt ? new Date(it.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : '28 May 2026'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 shrink-0">
                      <a 
                        target="_blank" 
                        rel="noreferrer"
                        href={fileUrl}
                        className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                        title="View File"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      
                      <a 
                        download
                        href={fileUrl}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        </div>
      </div>
    </SidebarLayout>
  );
}