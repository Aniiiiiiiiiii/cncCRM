'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Users,
  FolderGit2,
  FileClock,
  LifeBuoy,
  BadgeIndianRupee,
  Files
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const commandList = [
    { name: 'Go to Executive Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { name: 'View CRM Leads Management', path: '/dashboard/leads', icon: Users, category: 'Navigation' },
    { name: 'View Active Team Projects', path: '/dashboard/projects', icon: FolderGit2, category: 'Navigation' },
    { name: 'Clock Attendance & Leaves (HRMS)', path: '/dashboard/hrms', icon: FileClock, category: 'Navigation' },
    { name: 'Open Support Center / Helpdesk', path: '/dashboard/tickets', icon: LifeBuoy, category: 'Navigation' },
    { name: 'Invoices & Expense Sheets', path: '/dashboard/accounting', icon: BadgeIndianRupee, category: 'Navigation' },
    { name: 'Upload & Shared Documents', path: '/dashboard/documents', icon: Files, category: 'Navigation' },
  ];

  // Open modal via Ctrl+K
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = commandList.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleCommandSelect = (path: string) => {
    router.push(path);
    setQuery('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Dialog Drawer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[420px]"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 border-b border-slate-100 h-14">
              <Search size={18} className="text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search CRM command drawer..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-full text-slate-800 text-sm focus:outline-none placeholder-slate-400"
              />
              <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-lg select-none">
                ESC
              </span>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.path}
                      onClick={() => handleCommandSelect(cmd.path)}
                      className="w-full flex items-center justify-between px-3 py-3 hover:bg-slate-50 hover:text-indigo-600 rounded-xl text-left text-slate-600 text-sm transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        <span>{cmd.name}</span>
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all text-indigo-600" />
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Sparkles size={24} className="text-slate-300 animate-pulse" />
                  <span className="text-slate-400 text-xs mt-2">No matching CRM command found.</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
