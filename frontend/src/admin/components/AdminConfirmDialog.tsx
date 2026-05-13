
import React from 'react';
import AdminModal from './AdminModal';

interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const AdminConfirmDialog: React.FC<AdminConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Abort',
  type = 'danger'
}) => {
  const getColorClasses = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 shadow-red-500/20';
      case 'warning': return 'bg-amber-600 shadow-amber-500/20';
      default: return 'bg-indigo-600 shadow-indigo-500/20';
    }
  };

  const footer = (
    <div className="flex gap-4">
      <button 
        onClick={onClose}
        className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-2xl hover:bg-white/10 transition-all"
      >
        {cancelText}
      </button>
      <button 
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`flex-1 py-4 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg transition-all active:scale-95 ${getColorClasses()}`}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <AdminModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      subtitle="Security Confirmation Required"
      footer={footer}
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 ${
          type === 'danger' ? 'bg-red-500/10 text-red-500' : 
          type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
          'bg-indigo-500/10 text-indigo-500'
        }`}>
          {type === 'danger' ? (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          ) : (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          )}
        </div>
        <p className="text-slate-400 font-medium leading-relaxed">{message}</p>
      </div>
    </AdminModal>
  );
};

export default AdminConfirmDialog;
