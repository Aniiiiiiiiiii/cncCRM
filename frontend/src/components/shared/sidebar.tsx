'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  FolderGit2, 
  FileClock, 
  LifeBuoy, 
  BadgeIndianRupee, 
  Files, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Sparkles,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/auth-store';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', path: '/dashboard/leads', icon: Users },
    { name: 'Projects', path: '/dashboard/projects', icon: FolderGit2 },
    { name: 'HRMS Portal', path: '/dashboard/hrms', icon: FileClock },
    { name: 'Helpdesk', path: '/dashboard/tickets', icon: LifeBuoy },
    { name: 'Accounting', path: '/dashboard/accounting', icon: BadgeIndianRupee },
    { name: 'Calendar Sync', path: '/dashboard/calendar', icon: Calendar },
    { name: 'Team Chat', path: '/dashboard/chat', icon: MessageSquare },
    { name: 'File Vault', path: '/dashboard/documents', icon: Files },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between relative shadow-premium text-slate-400 select-none z-30"
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 overflow-hidden">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles size={16} className="text-white" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg text-white tracking-wider whitespace-nowrap"
                >
                  CNC <span className="text-indigo-400">CRM</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center flex hover:bg-slate-700 text-slate-300 absolute -right-3 top-5 cursor-pointer z-40 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/25' 
                      : 'hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session profile / logout footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center justify-between rounded-xl hover:bg-slate-800/40 p-2 gap-2 overflow-hidden transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-semibold text-sm shadow-inner uppercase">
              {user?.firstName?.slice(0, 1) || 'U'}{user?.lastName?.slice(0, 1) || 'A'}
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col whitespace-nowrap"
                >
                  <span className="text-sm font-semibold text-slate-200 leading-none">
                    {user?.firstName || 'Rajesh'} {user?.lastName || 'Sharma'}
                  </span>
                  <span className="text-xs text-slate-500 leading-none mt-1">
                    {user?.role?.name || 'Super Admin'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!isCollapsed && (
            <button 
              onClick={clearAuth}
              className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg cursor-pointer"
              title="Logout session"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
