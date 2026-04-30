
import React from 'react';
import { useApp } from '../../context/AppContext';

const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast?.visible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
      <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
};

export default Toast;
