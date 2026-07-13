'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Hash, 
  Sparkles,
  Search,
  CheckCheck,
  Zap
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth-store';

export default function ChatIndex() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeGroup, setActiveGroup] = useState<string>('general-sales');
  const [typedMessage, setTypedMessage] = useState('');

  // Query Channels/Groups
  const { data: groupsResponse } = useQuery({
    queryKey: ['chatGroups'],
    queryFn: async () => {
      const res = await api.get('/chat/groups');
      return res.data.groups;
    },
  });

  // Query Messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', activeGroup],
    queryFn: async () => {
      const res = await api.get(`/chat/groups/${activeGroup}/messages`);
      return res.data.messages;
    },
    enabled: !!activeGroup,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return api.post(`/chat/groups/${activeGroup}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeGroup] });
      setTypedMessage('');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    sendMessageMutation.mutate(typedMessage);
  };

  // Mock channels list for full-featured MVP
  const mockGroups = [
    { id: 'general-sales', name: 'General Sales Group', isDirect: false, unread: 2 },
    { id: 'tech-support', name: 'Engineering Sync Room', isDirect: false, unread: 0 },
    { id: 'client-chat', name: 'Stark Account Connect', isDirect: true, unread: 0 },
  ];

  // Mock messages lists for illustration
  const mockMessages = [
    { id: '1', sender: { firstName: 'Priya', lastName: 'Nair' }, content: 'Pushed the Wayne proposal to negotiation. Rajesh, please verify the SLA bounds.', createdAt: '2026-05-31T15:20:00Z' },
    { id: '2', sender: { firstName: 'Amit', lastName: 'Patel' }, content: 'Engineering is finalizing Stark armor HUD module optimizations. Almost ready for review.', createdAt: '2026-05-31T15:35:00Z' },
    { id: '3', sender: { firstName: 'Rajesh', lastName: 'Sharma' }, content: 'Outstanding work team. Let us secure this Stark account contract tomorrow!', createdAt: '2026-05-31T16:00:00Z' },
  ];

  const activeGroupDetails = mockGroups.find(g => g.id === activeGroup);

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white border border-slate-100 rounded-3xl shadow-premium overflow-hidden">
      {/* Channels Sidebar Column */}
      <div className="w-64 border-r border-slate-100 bg-slate-50/50 flex flex-col justify-between select-none">
        <div>
          {/* Header search */}
          <div className="p-4 border-b border-slate-100 relative flex items-center bg-white">
            <Search size={12} className="absolute left-7 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat spaces..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-[10px] focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Group Spaces */}
          <div className="p-3 space-y-4">
            <div>
              <span className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Team Channels</span>
              <div className="space-y-1">
                {mockGroups.filter(g => !g.isDirect).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs cursor-pointer transition-colors ${
                      activeGroup === g.id 
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hash size={14} className={activeGroup === g.id ? 'text-white' : 'text-slate-400'} />
                      <span className="truncate max-w-[120px]">{g.name}</span>
                    </div>
                    {g.unread > 0 && activeGroup !== g.id && (
                      <span className="w-4 h-4 bg-indigo-650 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                        {g.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Direct Messaging</span>
              <div className="space-y-1">
                {mockGroups.filter(g => g.isDirect).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs cursor-pointer transition-colors ${
                      activeGroup === g.id 
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-800'
                    }`}
                  >
                    <Users size={14} className={activeGroup === g.id ? 'text-white' : 'text-slate-400'} />
                    <span className="truncate">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-2 text-[9px] text-slate-400 bg-white">
          <Zap size={12} className="text-emerald-500 fill-emerald-100/10 animate-pulse" />
          <span>Socket.io Server Online</span>
        </div>
      </div>

      {/* Chat Pane */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50/20">
        {/* Active room header */}
        <div className="h-14 border-b border-slate-100 bg-white px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-slate-400" />
            <span className="font-bold text-slate-700 text-xs">{activeGroupDetails?.name || 'General Sales Space'}</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Sparkles size={10} /> Active Team Chat
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mockMessages.map((msg) => (
            <div key={msg.id} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-650 flex items-center justify-center font-bold text-xs uppercase shadow-inner border border-slate-300">
                {msg.sender.firstName.slice(0, 1)}{msg.sender.lastName.slice(0, 1)}
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-xs">{msg.sender.firstName} {msg.sender.lastName}</span>
                  <span className="text-[9px] text-slate-400">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="bg-white border border-slate-150 p-3 rounded-2xl rounded-tl-none text-slate-700 text-xs shadow-sm max-w-lg leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar form */}
        <form onSubmit={handleSendMessage} className="h-16 bg-white border-t border-slate-100 px-6 flex items-center gap-4">
          <input
            type="text"
            placeholder="Type your message here..."
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            className="flex-1 h-10 px-4 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl text-xs focus:outline-none text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-600/20 cursor-pointer transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
