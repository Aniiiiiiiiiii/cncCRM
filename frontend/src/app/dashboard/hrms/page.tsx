'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  FileClock, 
  Plus, 
  Calendar, 
  ClipboardList, 
  UserCheck,
  X
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Employee, Leave } from '../../../types';

const leaveSchema = z.object({
  leaveType: z.enum(['CASUAL', 'SICK', 'ANNUAL', 'UNPAID']),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().min(1, 'End date is required.'),
  reason: z.string().min(5, 'Please provide a valid reason (min 5 characters).'),
});

type LeaveFields = z.infer<typeof leaveSchema>;

export default function HRMSIndex() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(leaveSchema),
  });

  // Query HR Employees
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/hrms/employees');
      return res.data.employees as Employee[];
    },
  });

  // Query Leaves
  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const res = await api.get('/hrms/leaves');
      return res.data.leaves as Leave[];
    },
  });

  // Request Leave mutation
  const requestLeaveMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/hrms/leaves/request', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave request submitted successfully.');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to submit leave request.');
    },
  });

  const onSubmit = (data: any) => {
    requestLeaveMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileClock className="text-indigo-600" size={22} /> HRMS Corporate Portal
          </h2>
          <p className="text-slate-400 text-xs">Manage employee registers, leaves registry, and daily clocks</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
        >
          <Plus size={14} /> Request Leave
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <UserCheck size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Active Employees</h4>
            <span className="text-xl font-bold text-slate-800">{employees?.length || 1} Registered</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Clock-in Status</h4>
            <span className="text-xl font-bold text-slate-800">1 Present</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <ClipboardList size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Active Leaves</h4>
            <span className="text-xl font-bold text-slate-800">{leaves?.length || 1} Filed</span>
          </div>
        </div>
      </div>

      {/* Leaves Register Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h4 className="font-bold text-slate-800 text-sm">Leaves Registry Ledger</h4>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : leaves && leaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {leaves.map((lv) => (
                  <tr key={lv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">
                      {lv.employee.user.firstName} {lv.employee.user.lastName}
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{lv.leaveType}</td>
                    <td className="p-4">
                      {new Date(lv.startDate).toLocaleDateString()} - {new Date(lv.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-slate-400">{lv.reason}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        lv.status === 'APPROVED' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : lv.status === 'REJECTED' 
                          ? 'bg-red-50 text-red-500' 
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {lv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">No leaves registered.</div>
        )}
      </div>

      {/* Leave Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-sm">Submit Leave Request</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Leave Category</label>
                <select
                  {...register('leaveType')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-600 cursor-pointer appearance-none"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-600"
                  />
                  {errors.startDate && <span className="text-[10px] text-red-500">{errors.startDate.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">End Date</label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-600"
                  />
                  {errors.endDate && <span className="text-[10px] text-red-500">{errors.endDate.message}</span>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Reason</label>
                <textarea
                  {...register('reason')}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none resize-none text-slate-600"
                />
                {errors.reason && <span className="text-[10px] text-red-500">{errors.reason.message}</span>}
              </div>

              <button
                type="submit"
                disabled={requestLeaveMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                {requestLeaveMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
