'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  BadgeIndianRupee, 
  Plus, 
  Wallet, 
  DollarSign, 
  Receipt,
  X,
  CreditCard
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Invoice, Expense } from '../../../types';

const expenseSchema = z.object({
  amount: z.string().transform(Number),
  category: z.string().min(1, 'Category is required.'),
  date: z.string().min(1, 'Date is required.'),
  description: z.string().optional(),
});

type ExpenseFields = z.infer<typeof expenseSchema>;

export default function AccountingIndex() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  // Query Invoices
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/accounting/invoices');
      return res.data.invoices as Invoice[];
    },
  });

  // Query Expenses
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await api.get('/accounting/expenses');
      return res.data.expenses as Expense[];
    },
  });

  // Create Expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/accounting/expenses/create', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Corporate expense claimed successfully.');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to register expense.');
    },
  });

  const onSubmit = (data: any) => {
    createExpenseMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BadgeIndianRupee className="text-indigo-600" size={22} /> Invoices & Expenses Ledger
          </h2>
          <p className="text-slate-400 text-xs">Record ledger quotes, audit expenditures, and tax sheets</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
        >
          <Plus size={14} /> Log Expense
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Wallet size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Payments Collected</h4>
            <span className="text-xl font-bold text-slate-800">₹118,000</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
            <Receipt size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Total Expenses</h4>
            <span className="text-xl font-bold text-slate-800">
              ₹{(expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 1500).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <DollarSign size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Outstanding Invoices</h4>
            <span className="text-xl font-bold text-slate-800">₹0 Pending</span>
          </div>
        </div>
      </div>

      {/* Lists sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices List */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm">Corporate Invoices Ledger</h4>
          </div>
          {isLoadingInvoices ? (
            <div className="p-6 text-slate-450">Loading ledger...</div>
          ) : invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                    <th className="p-4">Invoice No</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Issue / Due Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">{inv.invoiceNumber}</td>
                      <td className="p-4">{inv.client.companyName}</td>
                      <td className="p-4">
                        {new Date(inv.issueDate).toLocaleDateString()} - {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-semibold">₹{Number(inv.total).toLocaleString()}</td>
                      <td className="p-4 text-right">
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
          ) : (
            <div className="p-12 text-center text-slate-400">No invoices generated yet.</div>
          )}
        </div>

        {/* Expenses List */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm">Expenses Claims Ledger</h4>
          </div>
          {isLoadingExpenses ? (
            <div className="p-6 text-slate-450">Loading claims...</div>
          ) : expenses && expenses.length > 0 ? (
            <div className="p-4 space-y-3">
              {expenses.map((exp) => (
                <div key={exp.id} className="border border-slate-100 p-3 rounded-xl flex items-center justify-between hover:border-indigo-200 transition-all cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700 text-xs">{exp.category}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">{new Date(exp.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-800 text-xs">₹{Number(exp.amount).toLocaleString()}</span>
                    <span className={`block text-[8px] font-bold mt-1 uppercase ${
                      exp.status === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">No expenses logged.</div>
          )}
        </div>
      </div>

      {/* Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-sm">Log Corporate Expense Claim</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Expense Category</label>
                <input
                  type="text"
                  placeholder="e.g. Software License, Client Meeting"
                  {...register('category')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none"
                />
                {errors.category && <span className="text-[10px] text-red-500">{errors.category.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Amount (INR)</label>
                  <input
                    type="number"
                    {...register('amount')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none"
                  />
                  {errors.amount && <span className="text-[10px] text-red-500">{errors.amount.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Expended Date</label>
                  <input
                    type="date"
                    {...register('date')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-slate-650"
                  />
                  {errors.date && <span className="text-[10px] text-red-500">{errors.date.message}</span>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description / Details</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={createExpenseMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                {createExpenseMutation.isPending ? 'Submitting Claim...' : 'File Expense Claim'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
