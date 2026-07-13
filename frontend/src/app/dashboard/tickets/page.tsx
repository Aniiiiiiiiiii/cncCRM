'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  LifeBuoy, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  X,
  Clock
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Ticket } from '../../../types';

const ticketSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  description: z.string().min(5, 'Please elaborate details (min 5 characters).'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  clientId: z.string().min(1, 'Client is required.'),
});

type TicketFields = z.infer<typeof ticketSchema>;

export default function TicketsIndex() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(ticketSchema),
  });

  // Query Support Tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const res = await api.get('/tickets');
      return res.data.tickets as Ticket[];
    },
  });

  // Create Ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/tickets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Successfully logged a new support ticket.');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to log support ticket.');
    },
  });

  const onSubmit = (data: any) => {
    createTicketMutation.mutate(data);
  };

  // Mock clients options for the dropdown selector
  const mockClients = [
    { id: '1', companyName: 'Stark Industries' },
    { id: '2', companyName: 'Cyberdyne Systems' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LifeBuoy className="text-indigo-600" size={22} /> Support Ticketing Center
          </h2>
          <p className="text-slate-400 text-xs">Coordinate customer tickets, categories, and SLA contracts</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
        >
          <Plus size={14} /> Log Ticket
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <HelpCircle size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Active Tickets</h4>
            <span className="text-xl font-bold text-slate-800">{tickets?.length || 1} Open</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">High Priority SLA</h4>
            <span className="text-xl font-bold text-slate-800">1 Urgent</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Resolved Tickets</h4>
            <span className="text-xl font-bold text-slate-800">8 Closed</span>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h4 className="font-bold text-slate-800 text-sm">Customer Tickets Dashboard</h4>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tickets && tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                  <th className="p-4">Ticket ID</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">SLA Deadline</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-700">{t.ticketNumber}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-sm">{t.subject}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{t.description.slice(0, 50)}...</span>
                      </div>
                    </td>
                    <td className="p-4">{t.client.companyName}</td>
                    <td className="p-4">
                      <span className={`px-1.5 py-0.5 rounded font-bold border ${
                        t.priority === 'URGENT' || t.priority === 'HIGH'
                          ? 'bg-red-50 text-red-500 border-red-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {t.slaDeadline ? new Date(t.slaDeadline).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        t.status === 'RESOLVED' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">No support tickets active.</div>
        )}
      </div>

      {/* Ticket Logging Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-sm">Log Client Support Ticket</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Client</label>
                <select
                  {...register('clientId')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-600 cursor-pointer appearance-none"
                >
                  <option value="">Select Client</option>
                  {mockClients.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
                {errors.clientId && <span className="text-[10px] text-red-500">{errors.clientId.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subject Topic</label>
                <input
                  type="text"
                  {...register('subject')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none"
                />
                {errors.subject && <span className="text-[10px] text-red-500">{errors.subject.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Priority Rating</label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-600 cursor-pointer appearance-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Troubleshoot Details</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none resize-none"
                />
                {errors.description && <span className="text-[10px] text-red-500">{errors.description.message}</span>}
              </div>

              <button
                type="submit"
                disabled={createTicketMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                {createTicketMutation.isPending ? 'Logging Ticket...' : 'Log Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
