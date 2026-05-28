'use client';

import Link from 'next/link';
import { MoreVertical, Trash2, Eye, RefreshCw, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';
import type { Assignment } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

const statusConfig = {
  pending: { label: 'Queued', className: 'text-gray-500 bg-gray-100' },
  processing: { label: 'Generating...', className: 'text-orange-700 bg-orange-100' },
  completed: { label: 'Ready', className: 'text-green-700 bg-green-100' },
  failed: { label: 'Failed', className: 'text-red-700 bg-red-100' },
};

export default function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const status = statusConfig[assignment.status];

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const assignedDate = format(new Date(assignment.createdAt), 'dd-MM-yyyy');
  const dueDate = format(new Date(assignment.dueDate), 'dd-MM-yyyy');

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        {/* Title + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-[15px] leading-tight truncate">
              {assignment.title}
            </h3>
            <span
              className={clsx(
                'text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 flex-shrink-0',
                status.className
              )}
            >
              {assignment.status === 'processing' && (
                <Loader2 size={10} className="animate-spin" />
              )}
              {status.label}
            </span>
          </div>

          {/* Question types summary */}
          <p className="text-xs text-gray-400 mt-1 truncate">
            {assignment.questionTypes.map((qt) => `${qt.numQuestions}× ${qt.type}`).join(' · ')}
          </p>
        </div>

        {/* 3-dot menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={16} className="text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[160px] py-1 animate-slide-up">
              {assignment.status === 'completed' && (
                <Link
                  href={`/assignments/${assignment._id}/paper`}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Eye size={15} />
                  View Assignment
                </Link>
              )}
              <button
                onClick={() => { onDelete(assignment._id); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">Assigned on</span> : {assignedDate}
        </p>
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">Due</span> : {dueDate}
        </p>
      </div>

      {/* Click to view if completed */}
      {assignment.status === 'completed' && (
        <Link
          href={`/assignments/${assignment._id}/paper`}
          className="absolute inset-0 rounded-2xl"
          aria-label={`View ${assignment.title}`}
        />
      )}
    </div>
  );
}