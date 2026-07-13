'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Sparkles, Mail, Lock } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = res.data;
      
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName}! Successfully logged in.`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {/* Decorative backdrop gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-950/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4 animate-bounce">
            <Sparkles size={22} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            CNC <span className="text-indigo-400">CRM</span>
          </h2>
          <p className="text-slate-500 text-xs mt-2 text-center">
            Sign in to access your Enterprise CRM Dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@codenclicks.com"
                {...register('email')}
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-2xl text-slate-200 text-sm focus:outline-none transition-all"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-400 mt-1 block">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 font-medium">Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-2xl text-slate-200 text-sm focus:outline-none transition-all"
              />
            </div>
            {errors.password && (
              <span className="text-xs text-red-400 mt-1 block">{errors.password.message}</span>
            )}
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials overlay panel */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3">
            Local Seeder Accounts
          </h4>
          <div className="space-y-1.5 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Super Admin:</span>
              <span className="font-semibold text-slate-400">superadmin@codenclicks.com</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Manager:</span>
              <span className="font-semibold text-slate-400">salesmanager@codenclicks.com</span>
            </div>
            <div className="flex justify-between">
              <span>Passphrase:</span>
              <span className="font-semibold text-slate-400">An1meParadise@2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
