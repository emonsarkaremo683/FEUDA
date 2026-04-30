
import React from 'react';

const AdminPlaceholder: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
      <div className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/20 animate-pulse">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
      </div>
      <div className="text-center">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">{title}</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Nexus Core Module Under Configuration</p>
      </div>
      <div className="max-w-md bg-white/2 border border-white/5 p-6 rounded-2xl text-center">
        <p className="text-slate-400 text-sm font-medium italic">"This module is currently being optimized for high-performance enterprise operations. All systems are standby."</p>
      </div>
    </div>
  );
};

export default AdminPlaceholder;
