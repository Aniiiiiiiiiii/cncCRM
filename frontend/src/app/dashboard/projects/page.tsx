'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  FolderGit2, 
  Plus, 
  Clock, 
  CheckSquare, 
  Briefcase,
  X,
  UserCheck
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Project, Task } from '../../../types';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  description: z.string().optional(),
  budget: z.any().transform((val) => val ? Number(val) : 10000),
});

type ProjectFields = z.infer<typeof projectSchema>;

export default function ProjectsIndex() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
  });

  // Query Active Projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data.projects as Project[];
    },
  });

  // Create Project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/projects', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Successfully provisioned new client project workspace.');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create project workspace.');
    },
  });

  const onSubmit = (data: any) => {
    createProjectMutation.mutate(data);
  };

  // Kanban mock columns
  const kanbanColumns = [
    { title: 'Planning', count: 1, status: 'PLANNING', color: 'border-t-slate-500 bg-slate-50' },
    { title: 'In Progress', count: 2, status: 'IN_PROGRESS', color: 'border-t-indigo-500 bg-indigo-50/20' },
    { title: 'Review', count: 1, status: 'REVIEW', color: 'border-t-amber-500 bg-amber-50/20' },
    { title: 'Completed', count: 3, status: 'COMPLETED', color: 'border-t-emerald-500 bg-emerald-50/20' },
  ];

  // Mock task lists for illustration of Kanban Board MVP
  const mockTasks = [
    { id: '1', title: 'Target overlay canvas refresh', assignee: 'Amit Patel', priority: 'HIGH', stage: 'IN_PROGRESS' },
    { id: '2', title: 'Setup Google calendar mock synchronization', assignee: 'Rajesh Sharma', priority: 'MEDIUM', stage: 'PLANNING' },
    { id: '3', title: 'Write JWT session refresh routes', assignee: 'Amit Patel', priority: 'URGENT', stage: 'REVIEW' },
    { id: '4', title: 'Verify lead scoring database parameters', assignee: 'Priya Nair', priority: 'LOW', stage: 'COMPLETED' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderGit2 className="text-indigo-600" size={22} /> Project Workspaces & Tasks
          </h2>
          <p className="text-slate-400 text-xs">Track client sprint milestones, tasks, and deadlines</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
        >
          <Plus size={14} /> New Project
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Briefcase size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Total Projects</h4>
            <span className="text-xl font-bold text-slate-800">{projects?.length || 2}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckSquare size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Completed Tasks</h4>
            <span className="text-xl font-bold text-slate-800">14</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Upcoming Milestones</h4>
            <span className="text-xl font-bold text-slate-800">3 Due</span>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {kanbanColumns.map((col) => {
          const colTasks = mockTasks.filter(t => t.stage === col.status);

          return (
            <div key={col.title} className={`border-t-4 ${col.color} p-4 rounded-2xl shadow-sm border border-slate-150 flex flex-col space-y-4 min-h-[360px]`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-700 text-xs">{col.title}</span>
                <span className="text-[10px] bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-lg font-bold">
                  {colTasks.length}
                </span>
              </div>

              {/* Task list container */}
              <div className="flex-1 space-y-3">
                {colTasks.map((t) => (
                  <div key={t.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3 hover:border-indigo-400 transition-all cursor-pointer">
                    <h5 className="font-semibold text-slate-800 text-xs">{t.title}</h5>
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span className={`px-1.5 py-0.5 rounded font-bold border ${
                        t.priority === 'URGENT' 
                          ? 'bg-red-50 text-red-500 border-red-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {t.priority}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck size={10} /> {t.assignee}
                      </span>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="h-full flex items-center justify-center py-12 text-slate-300 text-[10px]">
                    No active deliverables
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-sm">Create Project Workspace</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Project Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none"
                />
                {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={createProjectMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                {createProjectMutation.isPending ? 'Provisioning...' : 'Provision Workspace'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
