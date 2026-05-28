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
      <div className="p-6">
        {/* Page header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
          <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">Manage and create assignments for your classes.</p>

        {/* Search + filter bar */}
        {assignments.length > 0 && (
          <div className="flex gap-3 mb-6">
            <button className="btn-secondary px-3 py-2">
              <SlidersHorizontal size={15} />
              Filter By
            </button>
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Assignment"
                className="form-input pl-9"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-5 h-32 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && search ? (
          <div className="text-center py-24">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No assignments found for "{search}"</p>
          </div>
        ) : assignments.length === 0 ? (
          // Empty state (matches Figma)
          <div className="text-center py-24">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="w-28 h-24 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center">
                <FileX size={40} className="text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No assignments yet</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
              Create your first assignment to start collecting and grading student submissions.
              You can set up rubrics, define marking criteria, and let AI assist with grading.
            </p>
            <Link href="/assignments/create" className="btn-primary inline-flex">
              <Plus size={16} />
              Create Your First Assignment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((assignment) => (
              <div key={assignment._id} className="relative">
                <AssignmentCard assignment={assignment} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating create button */}
      {assignments.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 no-print">
          <Link href="/assignments/create" className="btn-primary shadow-lg shadow-orange-200 px-6 py-3">
            <Plus size={16} />
            Create Assignment
          </Link>
        </div>
      )}
    </SidebarLayout>
  );
}