'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { 
  BadgeIndianRupee, 
  TrendingUp, 
  FolderGit2, 
  LifeBuoy, 
  Users, 
  ArrowRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

const COLORS = ['#0F172A', '#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#64748B'];

export default function DashboardIndex() {
  const { user } = useAuthStore();

  const { data: statsResponse, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.stats;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-white border border-slate-200 rounded-3xl lg:col-span-2" />
          <div className="h-80 bg-white border border-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 border border-red-200 p-6 rounded-3xl text-sm flex items-center gap-3">
        <Users size={18} />
        <span>Failed to load CRM dashboard indicators. Please check database connectivity.</span>
      </div>
    );
  }

  const {
    totalRevenue = 0,
    pendingRevenue = 0,
    leadsCount = 0,
    activeProjects = 0,
    tickets = { open: 0, resolved: 0 },
    hrms = { totalEmployees: 0, presentToday: 0 },
    funnelData = [],
    leadSources = [],
    recentInvoices = []
  } = statsResponse || {};

  // Mock revenue over time values for chart representation
  const monthlyRevenueData = [
    { month: 'Jan', revenue: totalRevenue * 0.4 },
    { month: 'Feb', revenue: totalRevenue * 0.5 },
    { month: 'Mar', revenue: totalRevenue * 0.65 },
    { month: 'Apr', revenue: totalRevenue * 0.8 },
    { month: 'May', revenue: totalRevenue },
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Revenue</span>
            <h3 className="text-2xl font-bold text-slate-800">
              ₹{totalRevenue.toLocaleString()}
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1 w-max">
              <TrendingUp size={10} /> +12.4% vs last mo
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <BadgeIndianRupee size={20} />
          </div>
        </div>

        {/* Pending Revenue Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Bills</span>
            <h3 className="text-2xl font-bold text-slate-800">
              ₹{pendingRevenue.toLocaleString()}
            </h3>
            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1 w-max">
              <Clock size={10} /> Needs Auditing
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <TrendingDown size={20} />
          </div>
        </div>

        {/* Active Projects Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Sprints</span>
            <h3 className="text-2xl font-bold text-slate-800">{activeProjects}</h3>
            <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-lg flex items-center gap-1 w-max">
              Stark Armor HUD
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <FolderGit2 size={20} />
          </div>
        </div>

        {/* Support Tickets Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Open Tickets</span>
            <h3 className="text-2xl font-bold text-slate-800">{tickets.open}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1 w-max">
              {tickets.resolved} Resolved
            </span>
          </div>
          <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center shadow-inner">
            <LifeBuoy size={20} />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart Monthly Performance */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-slate-800 text-sm">Monthly Revenue Track</h4>
            <p className="text-slate-400 text-xs">Sum representation of PAID invoice pipelines</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Distribution (Pie Chart) */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-slate-800 text-sm">Lead Captures Distribution</h4>
            <p className="text-slate-400 text-xs">Total lead counts group by channels</p>
          </div>
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadSources.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[10px] text-slate-500 mt-2">
            {leadSources.map((s: any, i: number) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span>{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Funnel & Recent Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Funnel Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-slate-800 text-sm">Leads Pipeline Conversion</h4>
            <p className="text-slate-400 text-xs">Funnels progression through sales lifecycle</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" fill="#64748B" stroke="none" dataKey="name" fontSize={10} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoices Ledger Table */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Recent Ledger Sheets</h4>
                <p className="text-slate-400 text-xs">Last 5 invoices generated by accounting</p>
              </div>
              <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 cursor-pointer">
                View Ledger <ArrowRight size={12} />
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3">Invoice No</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  {recentInvoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-700">{inv.invoiceNumber}</td>
                      <td className="py-3">{inv.client.companyName}</td>
                      <td className="py-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 font-semibold">₹{Number(inv.total).toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          inv.status === 'PAID' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-red-50 text-red-500'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
