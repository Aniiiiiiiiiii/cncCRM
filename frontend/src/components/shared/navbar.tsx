'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Clock, 
  LogOut, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export default function Navbar({ onSearchTrigger }: { onSearchTrigger: () => void }) {
  const { user, clearAuth } = useAuthStore();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClockToggle = async () => {
    setIsLoading(true);
    try {
      if (!isClockedIn) {
        await api.post('/hrms/clock-in');
        setIsClockedIn(true);
        toast.success('Successfully clocked in today. Have a great shift!');
      } else {
        await api.post('/hrms/clock-out');
        setIsClockedIn(false);
        toast.success('Successfully clocked out. Thank you for your work!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Attendance action failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Welcome Message / Command Palette Trigger */}
      <div className="flex items-center gap-6">
        <h1 className="font-semibold text-slate-800 text-base hidden sm:block">
          {getGreeting()}, <span className="text-indigo-600">{user?.firstName || 'Rajesh'}</span>!
        </h1>

        {/* Global Search command palette trigger button */}
        <button 
          onClick={onSearchTrigger}
          className="flex items-center gap-3 px-3 py-2 w-64 text-left border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-400 text-xs transition-all cursor-pointer shadow-sm group"
        >
          <Search size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span>Quick search...</span>
          <span className="ml-auto font-mono text-[9px] bg-slate-200/80 group-hover:bg-slate-300/80 text-slate-600 px-1.5 py-0.5 rounded transition-all">
            Ctrl + K
          </span>
        </button>
      </div>

      {/* Action Buttons: Clock Attendance, Notifications, Profile logout */}
      <div className="flex items-center gap-4">
        {/* Clock Attendance trigger */}
        <button
          onClick={handleClockToggle}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all cursor-pointer ${
            isClockedIn 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
              : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Clock size={14} className={isClockedIn ? 'animate-pulse text-emerald-600' : 'text-white'} />
          <span>{isClockedIn ? 'Clocked In' : 'Clock In'}</span>
        </button>

        {/* Dynamic calendar date */}
        <div className="hidden lg:flex items-center gap-2 text-slate-500 text-xs">
          <Calendar size={14} />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Bell Notifications */}
        <button 
          onClick={() => toast.info('No new notifications.', { icon: <AlertCircle size={16} /> })}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer relative"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-slate-200"></div>

        {/* Logout */}
        <button 
          onClick={clearAuth}
          className="p-2 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 cursor-pointer transition-colors"
          title="Sign out session"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
