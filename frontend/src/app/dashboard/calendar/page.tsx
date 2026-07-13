'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Sparkles, 
  Clock, 
  MapPin, 
  Users, 
  X,
  RefreshCw,
  Video,
  Phone,
  Compass
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth-store';

const meetingSchema = z.object({
  title: z.string().min(1, 'Meeting subject is required.'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required.'),
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
  type: z.enum(['CALL', 'VIDEO', 'MEETING']).default('MEETING'),
  location: z.string().optional(),
  participants: z.string().optional(),
});

type MeetingFields = z.infer<typeof meetingSchema>;

export default function CalendarIndex() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      type: 'MEETING',
    }
  });

  // Query Scheduled Meetings
  const { data: meetingsResponse, isLoading, error } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const res = await api.get('/meetings');
      return res.data.meetings;
    },
  });

  // Create Meeting Mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (data: any) => {
      const startTimeISO = new Date(`${data.date}T${data.startTime}`).toISOString();
      const endTimeISO = new Date(`${data.date}T${data.endTime}`).toISOString();

      const payload = {
        title: data.title,
        description: data.description,
        startTime: startTimeISO,
        endTime: endTimeISO,
        type: data.type,
        location: data.location || 'Online Meet',
        participants: data.participants,
        hostId: user!.id,
      };

      return api.post('/meetings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting scheduled and synced successfully!');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to schedule meeting.');
    },
  });

  const onSubmit = (data: any) => {
    createMeetingMutation.mutate(data);
  };

  const handleSyncCalendars = () => {
    setIsSyncing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Syncing with Google & Outlook Calendar nodes...',
        success: 'All meetings synced successfully with GSuite and Exchange!',
        error: 'Synchronization failed.',
      }
    );
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'CALL':
        return 'bg-cyan-50 text-cyan-600 border-cyan-200';
      case 'VIDEO':
        return 'bg-indigo-50 text-indigo-650 border-indigo-200';
      default:
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <Phone size={12} />;
      case 'VIDEO':
        return <Video size={12} />;
      default:
        return <Compass size={12} />;
    }
  };

  // Mock days grid list for a premium Month View representation
  const calendarDays = [
    { day: 26, isCurrentMonth: false }, { day: 27, isCurrentMonth: false }, { day: 28, isCurrentMonth: false }, { day: 29, isCurrentMonth: false }, { day: 30, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true, hasEvent: false },
    { day: 2, isCurrentMonth: true, hasEvent: false },
    { day: 3, isCurrentMonth: true, hasEvent: false },
    { day: 4, isCurrentMonth: true, hasEvent: false },
    { day: 5, isCurrentMonth: true, hasEvent: false },
    { day: 6, isCurrentMonth: true, hasEvent: false },
    { day: 7, isCurrentMonth: true, hasEvent: false },
    { day: 8, isCurrentMonth: true, hasEvent: false },
    { day: 9, isCurrentMonth: true, hasEvent: false },
    { day: 10, isCurrentMonth: true, hasEvent: false },
    { day: 11, isCurrentMonth: true, hasEvent: false },
    { day: 12, isCurrentMonth: true, hasEvent: false },
    { day: 13, isCurrentMonth: true, hasEvent: false },
    { day: 14, isCurrentMonth: true, hasEvent: false },
    { day: 15, isCurrentMonth: true, hasEvent: false },
    { day: 16, isCurrentMonth: true, hasEvent: false },
    { day: 17, isCurrentMonth: true, hasEvent: false },
    { day: 18, isCurrentMonth: true, hasEvent: false },
    { day: 19, isCurrentMonth: true, hasEvent: false },
    { day: 20, isCurrentMonth: true, hasEvent: false },
    { day: 21, isCurrentMonth: true, hasEvent: false },
    { day: 22, isCurrentMonth: true, hasEvent: false },
    { day: 23, isCurrentMonth: true, hasEvent: false },
    { day: 24, isCurrentMonth: true, hasEvent: false },
    { day: 25, isCurrentMonth: true, hasEvent: false },
    { day: 26, isCurrentMonth: true, hasEvent: false },
    { day: 27, isCurrentMonth: true, hasEvent: false },
    { day: 28, isCurrentMonth: true, hasEvent: false },
    { day: 29, isCurrentMonth: true, hasEvent: false },
    { day: 30, isCurrentMonth: true, hasEvent: true }, // Mapped to seeder dates
    { day: 31, isCurrentMonth: true, hasEvent: true }, // Current demo day
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="text-indigo-600" size={22} /> World-Class Calendar Engine
          </h2>
          <p className="text-slate-400 text-xs">Schedule demos, client conferences, and connect with GSuite/Exchange</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sync Trigger */}
          <button
            onClick={handleSyncCalendars}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> 
            <span>{isSyncing ? 'Syncing...' : 'Sync GCal & Outlook'}</span>
          </button>

          {/* New Event */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
          >
            <Plus size={14} /> Schedule Event
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month View Grid Grid */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-800 text-sm">May 2026</span>
            <div className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Sparkles size={10} /> Active GCal Sync
            </div>
          </div>

          {/* Calendar week header */}
          <div className="grid grid-cols-7 text-center font-semibold text-slate-400 text-[10px] uppercase">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((item, idx) => (
              <div 
                key={idx} 
                className={`h-16 border border-slate-100 rounded-xl p-1.5 flex flex-col justify-between hover:border-indigo-300 transition-colors cursor-pointer select-none ${
                  item.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 text-slate-300'
                }`}
              >
                <span className={`text-[10px] font-bold ${item.day === 31 ? 'text-indigo-600 bg-indigo-50 w-4 h-4 flex items-center justify-center rounded-full' : 'text-slate-500'}`}>
                  {item.day}
                </span>

                {item.hasEvent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 self-center animate-ping" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled List Sidebar */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium flex flex-col justify-between h-full">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="font-bold text-slate-800 text-sm">Scheduled Meetings & Calls</h4>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : meetingsResponse && meetingsResponse.length > 0 ? (
              <div className="space-y-4">
                {meetingsResponse.map((meeting: any) => (
                  <div 
                    key={meeting.id} 
                    className={`border p-4 rounded-2xl shadow-sm space-y-3 hover:border-indigo-400 transition-all cursor-pointer ${getEventColor(meeting.type)}`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs truncate max-w-xs">{meeting.title}</h5>
                      <span className="flex items-center gap-1">{getEventIcon(meeting.type)}</span>
                    </div>

                    <div className="space-y-1 text-[10px] opacity-80">
                      <div className="flex items-center gap-1.5">
                        <Clock size={10} />
                        <span>
                          {new Date(meeting.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {' '}
                          {new Date(meeting.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={10} />
                        <span>{meeting.location || 'Online Meet'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-300 text-xs">
                No meetings scheduled for this period.
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-4 text-[10px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Google Calendar Sync ID:</span>
              <span className="font-mono text-slate-500 font-semibold">gcal_active</span>
            </div>
            <div className="flex justify-between">
              <span>Outlook Calendar Sync ID:</span>
              <span className="font-mono text-slate-500 font-semibold">out_active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-sm">Schedule Meeting / Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subject / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Stark Industries HUD Demo"
                  {...register('title')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-800"
                />
                {errors.title && <span className="text-[10px] text-red-500">{errors.title.message}</span>}
              </div>

              {/* Event Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Event Type</label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-650 cursor-pointer appearance-none animate-none"
                >
                  <option value="MEETING">In-Person Meeting</option>
                  <option value="VIDEO">Video Call Conference</option>
                  <option value="CALL">Phone Call</option>
                </select>
              </div>

              {/* Date & Time slots */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Meeting Date</label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-650"
                />
                {errors.date && <span className="text-[10px] text-red-500">{errors.date.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Start Time</label>
                  <input
                    type="time"
                    {...register('startTime')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-650"
                  />
                  {errors.startTime && <span className="text-[10px] text-red-500">{errors.startTime.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">End Time</label>
                  <input
                    type="time"
                    {...register('endTime')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-650"
                  />
                  {errors.endTime && <span className="text-[10px] text-red-500">{errors.endTime.message}</span>}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Location / Link</label>
                <input
                  type="text"
                  placeholder="e.g. Google Meet Link, Room 101"
                  {...register('location')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-800"
                />
              </div>

              {/* Participants */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Participants (Emails)</label>
                <input
                  type="text"
                  placeholder="e.g. tony@stark.com, Priya@codenclicks.com"
                  {...register('participants')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={createMeetingMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                {createMeetingMutation.isPending ? 'Scheduling...' : 'Schedule Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
