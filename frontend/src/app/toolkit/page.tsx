"use client";

import { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';

export default function ToolkitPage() {
  const [prompt, setPrompt] = useState('Generate a rubric for a 10-mark algebra test');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Safely extracts the clean text string from the raw API response
  const getCleanText = (rawResult: string) => {
    if (!rawResult) return '';
    try {
      const parsed = JSON.parse(rawResult);
      if (parsed.text) return parsed.text;
      if (parsed.data) return typeof parsed.data === 'string' ? parsed.data : JSON.stringify(parsed.data);
      if (parsed.result) return typeof parsed.result === 'string' ? parsed.result : JSON.stringify(parsed.result);
    } catch (e) {
      // Fallback if it's already a clean string
    }
    return rawResult;
  };

  const cleanText = getCleanText(result);

  async function runTool(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setCopied(false);
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
      
      setResult(typeof data === 'string' ? data : JSON.stringify(data));
    } catch (err: any) {
      setResult(JSON.stringify({ text: err.message || 'An unexpected error occurred.' }));
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = async () => {
    if (!cleanText) return;
    try {
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <SidebarLayout breadcrumb="AI Toolkit">
      <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-white py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
        <div className="relative mb-10 pb-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-500 rounded-lg text-white shadow-md shadow-orange-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              AI Teacher's <span className="text-orange-500">Toolkit</span>
            </h2>
          </div>
          <p className="text-base text-gray-500 max-w-2xl ml-11">
            Generate high-quality rubrics, lesson plans, and assignments instantly. Built to save you hours of prep time.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Left Column: Interactive Form */}
          <div className="lg:col-span-2 group">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
              <form onSubmit={runTool} className="space-y-5">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide uppercase text-xs">
                    What would you like to create?
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-4 text-sm text-gray-800 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 resize-y min-h-[140px] focus:outline-none leading-relaxed shadow-inner"
                    placeholder="Describe your assessment or prompt..."
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full flex justify-center items-center px-5 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all duration-150 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating layout...
                    </>
                  ) : (
                    'Generate Output'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Display Console */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col min-h-[420px]">
              
              {/* Box Top Header */}
              <div className="bg-gray-50/70 backdrop-blur-sm px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-gray-700 tracking-wide uppercase text-xs">Generated Output</h3>
                </div>

                {/* Interactive Dynamic Action Controls */}
                {cleanText && !loading && (
                  <div className="flex items-center space-x-2 animate-fade-in">
                    <button
                      onClick={handleCopy}
                      className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none ${
                        copied 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                          Copy Output
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setResult('')}
                      className="inline-flex items-center px-3 py-1.5 border border-red-100 text-xs font-medium rounded-lg text-red-600 bg-red-50/50 hover:bg-red-50 transition-all duration-200 focus:outline-none"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              
              {/* Content Panel Area */}
              <div className="p-6 flex-grow bg-gray-50/30 flex flex-col justify-between">
                {loading ? (
                  <div className="my-auto flex flex-col items-center justify-center space-y-4 py-12">
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-orange-500/20 rounded-full absolute"></div>
                      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">Assembling Rubric</p>
                      <p className="text-xs text-gray-400 mt-0.5">Structuring response markers...</p>
                    </div>
                  </div>
                ) : cleanText ? (
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-gray-800 font-sans leading-relaxed tracking-normal overflow-auto max-h-[500px]">
                    {/* Clean formatted rendering replaces code block layout */}
                    <div className="whitespace-pre-line text-sm sm:text-base selection:bg-orange-100">
                      {cleanText}
                    </div>
                  </div>
                ) : (
                  <div className="my-auto flex flex-col items-center justify-center text-gray-400 py-16 text-center max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-400 mb-4 border border-orange-100/50">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-700 mb-1">Workspace Standby</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Provide instructions on the left workspace panel and trigger build to view generated results.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
        </div>
      </div>
    </SidebarLayout>
  );
}