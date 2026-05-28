"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home,
  Users,
  FileText,
  Wand2,
  Library,
  Settings,
  Plus,
  Bell,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';
import { useAssignmentStore } from '@/store/assignmentStore';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function NavItem({ href, icon, label, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href) && href !== '/';

  return (
    <Link
      href={href}
      className={clsx(
        'nav-item',
        isActive && 'active'
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

interface SidebarLayoutProps {
  children: React.ReactNode;
  breadcrumb?: string;
}

export default function SidebarLayout({ children, breadcrumb }: SidebarLayoutProps) {
  const { assignments, wsConnected } = useAssignmentStore();
  const completedCount = assignments.length;
  const [userName, setUserName] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem('userName'));
    setSchoolName(localStorage.getItem('schoolName'));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">VedaAI</span>
          </div>
        </div>

        {/* Create Assignment CTA */}
        <div className="px-4 pt-4">
          <Link href="/assignments/create" className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-orange-400 text-orange-600 px-4 py-3 font-semibold shadow-sm hover:bg-orange-50">
            <Plus size={16} />
            Create Assignment
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          <NavItem href="/" icon={<Home size={16} />} label="Home" />
          <NavItem href="/groups" icon={<Users size={16} />} label="My Groups" />
          <NavItem
            href="/assignments"
            icon={<FileText size={16} />}
            label="Assignments"
            badge={completedCount}
          />
          <NavItem href="/toolkit" icon={<Wand2 size={16} />} label="AI Teacher's Toolkit" />
          <NavItem href="/library" icon={<Library size={16} />} label="My Library" />
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-gray-100 pt-3 flex flex-col justify-between flex-0">
          <div>
            <NavItem href="/settings" icon={<Settings size={16} />} label="Settings" />

            {/* WS indicator */}
            {wsConnected && (
              <div className="flex items-center gap-2 px-3 py-1 mt-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Live</span>
              </div>
            )}
          </div>

          {/* Bottom user card (matches mockup) */}
          <div className="mt-3 px-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-700 font-semibold text-sm">{userName ? userName.charAt(0).toUpperCase() : 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{schoolName || 'Your School'}</p>
                <p className="text-xs text-gray-500 truncate">{userName || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileText size={15} />
            <span className="font-medium text-gray-700">{breadcrumb || 'Assignment'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}