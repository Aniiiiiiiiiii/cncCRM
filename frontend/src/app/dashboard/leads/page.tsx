'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Pencil,
  Mail, 
  Building2, 
  X,
  Phone,
  AlertCircle
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Lead } from '../../../types';

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().optional().or(z.literal('')),
  email: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST']).default('NEW'),
  notes: z.string().optional().or(z.literal('')),
});

type LeadFields = z.infer<typeof leadSchema>;

export default function LeadsIndex() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      priority: 'MEDIUM',
      status: 'NEW',
    }
  });

  // Query CRM leads
  const { data: leadsResponse, isLoading, error } = useQuery({
    queryKey: ['leads', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/leads', {
        params: { search, status: statusFilter || undefined },
      });
      return res.data.leads as Lead[];
    },
  });

  // Mutate create lead
  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/leads', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Successfully registered a new lead in CRM pipeline.');
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create lead.');
    },
  });

  // Mutate update lead
  const updateLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.put(`/leads/${selectedLead?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Successfully updated lead details.');
      setIsModalOpen(false);
      setSelectedLead(null);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update lead.');
    },
  });

  // Mutate delete lead
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Successfully removed lead from records.');
    },
    onError: () => {
      toast.error('Failed to remove lead.');
    },
  });

  const onSubmit = (data: any) => {
    if (selectedLead) {
      updateLeadMutation.mutate(data);
    } else {
      createLeadMutation.mutate(data);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'MEDIUM':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Top triggers */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-indigo-600" size={22} /> Lead Management Database
          </h2>
          <p className="text-slate-400 text-xs">Record, track, and score your customer pipelines</p>
        </div>

        <button
          onClick={() => {
            setSelectedLead(null);
            reset({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              company: '',
              priority: 'MEDIUM',
              status: 'NEW',
              notes: '',
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus size={14} /> Add Lead
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-premium flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative flex items-center">
          <Search size={14} className="absolute left-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none placeholder-slate-400 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48 relative flex items-center">
          <Filter size={14} className="absolute left-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-600 transition-colors cursor-pointer appearance-none animate-none"
          >
            <option value="">All Stages</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* List Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-xs">Failed to load leads.</div>
        ) : leadsResponse && leadsResponse.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                  <th className="p-4">Name</th>
                  <th className="p-4">Business Email</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Company Name</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {leadsResponse.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name */}
                    <td className="p-4 font-semibold text-slate-800 text-sm">
                      {lead.firstName} {lead.lastName || ''}
                    </td>

                    {/* Business Email */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-650">
                        <Mail size={12} className="text-slate-400" />
                        <span>{lead.email || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-650">
                        <Phone size={12} className="text-slate-400" />
                        <span>{lead.phone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Company Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-650">
                        <Building2 size={12} className="text-slate-400" />
                        <span>{lead.company || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getPriorityBadge(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        lead.status === 'WON' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : lead.status === 'LOST' 
                          ? 'bg-red-50 text-red-500' 
                          : 'bg-indigo-50 text-indigo-650'
                      }`}>
                        {lead.status}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="p-4 max-w-xs truncate text-slate-500" title={lead.notes || ''}>
                      {lead.notes || 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          reset({
                            firstName: lead.firstName,
                            lastName: lead.lastName || '',
                            email: lead.email || '',
                            phone: lead.phone || '',
                            company: lead.company || '',
                            priority: lead.priority,
                            status: lead.status,
                            notes: lead.notes || '',
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        title="Edit record"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteLeadMutation.mutate(lead.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Remove record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Users size={32} className="text-slate-300 animate-pulse mb-3" />
            <h4 className="text-slate-500 font-semibold text-sm">No leads recorded.</h4>
            <p className="text-slate-400 text-[10px] mt-1">Try resetting filters or register a new lead.</p>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-sm">
                {selectedLead ? 'Edit CRM Lead Details' : 'Register New CRM Lead'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedLead(null);
                }}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-650 rounded-lg cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">First Name</label>
                  <input
                    type="text"
                    {...register('firstName')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none"
                  />
                  {errors.firstName && <span className="text-[10px] text-red-500">{errors.firstName.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name</label>
                  <input
                    type="text"
                    {...register('lastName')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none"
                  />
                  {errors.lastName && <span className="text-[10px] text-red-500">{errors.lastName.message}</span>}
                </div>
              </div>

              {/* Business Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Business Email</label>
                <input
                  type="email"
                  placeholder="name@business.com"
                  {...register('email')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none"
                />
                {errors.email && <span className="text-[10px] text-red-500">{errors.email.message}</span>}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 99999 88888"
                  {...register('phone')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none"
                />
                {errors.phone && <span className="text-[10px] text-red-500">{errors.phone.message}</span>}
              </div>

              {/* Company Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Software IT Solutions"
                  {...register('company')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none"
                />
                {errors.company && <span className="text-[10px] text-red-500">{errors.company.message}</span>}
              </div>

              {/* Priority & Status Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Priority Level</label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-600 cursor-pointer appearance-none animate-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Stage Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-600 cursor-pointer appearance-none animate-none"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Notes / Requirements</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={createLeadMutation.isPending || updateLeadMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                {selectedLead 
                  ? (updateLeadMutation.isPending ? 'Updating...' : 'Update Lead') 
                  : (createLeadMutation.isPending ? 'Registering...' : 'Register Lead')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
