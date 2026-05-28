'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Plus, FileX } from 'lucide-react';
import toast from 'react-hot-toast';
import SidebarLayout from '@/components/layout/SidebarLayout';
import AssignmentCard from '@/components/assignment/AssignmentCard';
import { useAssignmentStore } from '@/store/assignmentStore';
import { api } from '@/lib/api';

export default function AssignmentsPage() {
  const { assignments, setAssignments, removeAssignment } = useAssignmentStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAssignments()
      .then(setAssignments)
      .catch(() => toast.error('Failed to load assignments'))
      .finally(() => setLoading(false));
  }, [setAssignments]);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    try {
      await api.deleteAssignment(id);
      removeAssignment(id);
      toast.success('Assignment deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }

  return (
    <SidebarLayout breadcrumb="Assignment">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">

        {/* Search + Filter Panel Container (Top of the page now) */}
        {assignments.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-white p-3 rounded-2xl border border-gray-200/60 shadow-sm">
            <button className="inline-flex items-center justify-center gap-2 px-4 h-11 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer shrink-0">
              <SlidersHorizontal size={15} className="text-gray-500" />
              Filter By
            </button>
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assignments by name..."
                className="w-full h-11 pl-10 pr-4 text-sm text-gray-800 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Core Content Grid Wrapper */}
        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm h-36 flex flex-col justify-between animate-pulse">
                <div>
                  <div className="h-4.5 bg-gray-200/80 rounded-md w-2/3 mb-3" />
                  <div className="h-3.5 bg-gray-100 rounded-md w-1/2" />
                </div>
                <div className="h-3 bg-gray-100 rounded-md w-1/4 self-end" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && search ? (
          /* Search Empty State */
          <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-inner">
            <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 mb-4">
              <Search size={28} />
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">No matching assignments</h3>
            <p className="text-xs text-gray-400 max-w-xs px-4">
              We couldn't find anything matching <span className="font-semibold text-gray-600">"{search}"</span>.
            </p>
          </div>
        ) : assignments.length === 0 ? (
          /* Core Empty State */
          <div className="max-w-md mx-auto text-center py-16 px-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm mt-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 border border-red-100/60 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-sm">
              <FileX size={32} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">No assignments yet</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Create your first assignment to start collecting and grading student submissions. 
              Set up rubrics, define criteria, and utilize built-in AI tools.
            </p>
            <Link 
              href="/assignments/create" 
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all w-full sm:w-auto"
            >
              <Plus size={16} />
              Create Your First Assignment
            </Link>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((assignment) => (
              <div key={assignment._id} className="relative group transition-all duration-200">
                <AssignmentCard assignment={assignment} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Trigger Button (Always visible on mobile/desktop since header action is gone) */}
      {assignments.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 no-print z-50 px-4 sm:px-0">
          <Link 
            href="/assignments/create" 
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-xl shadow-orange-500/20 active:scale-[0.97] transition-all whitespace-nowrap"
          >
            <Plus size={18} />
            Create Assignment
          </Link>
        </div>
      )}
    </SidebarLayout>
  );
}