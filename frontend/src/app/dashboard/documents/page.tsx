'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Files, 
  FolderPlus, 
  UploadCloud, 
  Folder, 
  FileText, 
  ArrowDownToLine, 
  LayoutGrid,
  HardDrive
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

export default function DocumentsIndex() {
  const queryClient = useQueryClient();
  const [folderName, setFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Query Files & Folders
  const { data: fileSystem, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data;
    },
  });

  // Create Folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      return api.post('/documents/folder', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Directory folder created successfully.');
      setFolderName('');
    },
    onError: () => {
      toast.error('Failed to create folder.');
    },
  });

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    createFolderMutation.mutate(folderName);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded to file vault successfully.');
    } catch (err) {
      toast.error('Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Files className="text-indigo-600" size={22} /> Document Vault Explorer
          </h2>
          <p className="text-slate-400 text-xs">Secure workspace directory structure, file uploads, and access credentials</p>
        </div>

        {/* Dynamic file upload trigger */}
        <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all">
          <UploadCloud size={14} /> 
          <span>{isUploading ? 'Uploading...' : 'Upload Document'}</span>
          <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
        </label>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <HardDrive size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Storage Utilized</h4>
            <span className="text-xl font-bold text-slate-800">14.2 MB / 100 GB</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Folder size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Folders Created</h4>
            <span className="text-xl font-bold text-slate-800">{fileSystem?.folders?.length || 2} Directories</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
            <LayoutGrid size={18} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Documents Count</h4>
            <span className="text-xl font-bold text-slate-800">{fileSystem?.documents?.length || 1} Uploaded</span>
          </div>
        </div>
      </div>

      {/* Create Folder & Directories View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Create Folder Column */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium h-max space-y-4">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
            <FolderPlus size={14} className="text-slate-400" /> Make Folder
          </h4>
          <form onSubmit={handleCreateFolder} className="space-y-3">
            <input
              type="text"
              placeholder="e.g. Acme Software Layouts"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none placeholder-slate-400"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-[10px] rounded-xl cursor-pointer transition-colors"
            >
              Add Folder
            </button>
          </form>
        </div>

        {/* Directory Explorer Pane */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium lg:col-span-3 space-y-6">
          {/* Folders block */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Directories / Folders</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(fileSystem?.folders && fileSystem.folders.length > 0) ? (
                fileSystem.folders.map((f: any) => (
                  <div key={f.id} className="border border-slate-150 p-4 rounded-xl flex flex-col gap-2 hover:border-indigo-300 transition-colors cursor-pointer select-none bg-slate-50/20">
                    <Folder size={20} className="text-indigo-500 fill-indigo-100/10" />
                    <span className="font-semibold text-slate-700 text-xs truncate">{f.name}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-4 border border-dashed border-slate-200 p-8 text-center text-slate-300 text-xs rounded-xl flex items-center justify-center gap-2">
                  <Folder size={14} /> Create directory to arrange vaults
                </div>
              )}
            </div>
          </div>

          {/* Files block */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Documents / Files</h4>
            <div className="space-y-2">
              {(fileSystem?.documents && fileSystem.documents.length > 0) ? (
                fileSystem.documents.map((d: any) => (
                  <div key={d.id} className="border border-slate-150 p-3 rounded-xl flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer bg-slate-50/10">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-indigo-500" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 text-xs truncate max-w-xs">{d.name}</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">{(d.fileSize / 1024).toFixed(1)} KB • {d.fileType}</span>
                      </div>
                    </div>
                    <a
                      href={`http://localhost:5000${d.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <ArrowDownToLine size={14} />
                    </a>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs rounded-xl">
                  No uploaded files in this directory.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
