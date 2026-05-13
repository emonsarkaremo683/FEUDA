
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';
import AdminConfirmDialog from '../components/AdminConfirmDialog';

interface UserIdentity {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  created_at: string;
}

const AdminUsers: React.FC = () => {
  const { token } = useApp();
  const [users, setUsers] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Confirm State
  const [confirmRole, setConfirmRole] = useState<{ isOpen: boolean; userId: number | null; name: string; currentRole: string }>({
    isOpen: false,
    userId: null,
    name: '',
    currentRole: ''
  });
  
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; userId: number | null; name: string }>({
    isOpen: false,
    userId: null,
    name: ''
  });

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Users Load Failed:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const toggleRole = (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ role: newRole })
    }).then(() => fetchUsers());
  };

  const handleDeleteUser = (userId: number) => {
    fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => fetchUsers());
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Identity Registry</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Authorized User Catalog</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
             <input 
               type="text" 
               placeholder="Search identities..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="bg-white/5 border border-white/10 rounded-2xl px-12 py-3 text-xs font-bold text-white outline-none focus:border-purple-500 transition-all w-64"
             />
             <svg className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <div className="flex bg-white/5 rounded-2xl p-1 gap-1 border border-white/5">
            <div className="px-4 py-2 border-r border-white/5 flex flex-col items-center min-w-[80px]">
              <span className="text-white font-black text-lg leading-tight">{users.length}</span>
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Total</span>
            </div>
            <div className="px-4 py-2 flex flex-col items-center min-w-[80px]">
              <span className="text-purple-500 font-black text-lg leading-tight">{users.filter(u => u.role === 'admin').length}</span>
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Admins</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#161920] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black bg-white/2">
                <th className="px-8 py-5">Identity</th>
                <th className="px-8 py-5">Role Clearance</th>
                <th className="px-8 py-5">Registration Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-white/5 border-t-purple-500 rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing Registry...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No matching identities found in the system</p>
                  </td>
                </tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-purple-500/10">
                        {u.fullName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{u.fullName}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-500/10 text-slate-400 border border-white/5'
                    }`}>
                      {u.role} Access
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-xs font-bold">
                    {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end items-center gap-4">
                      <button 
                        onClick={() => setConfirmRole({ isOpen: true, userId: u.id, name: u.fullName, currentRole: u.role })}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-2 group/btn"
                      >
                        <svg className="w-3.5 h-3.5 group-hover/btn:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m4-4l-4-4"/></svg>
                        Permute
                      </button>
                      <button 
                        onClick={() => setConfirmDelete({ isOpen: true, userId: u.id, name: u.fullName })}
                        className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-lg transition-all"
                        title="Purge Identity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Confirmation */}
      <AdminConfirmDialog 
        isOpen={confirmRole.isOpen}
        onClose={() => setConfirmRole({ ...confirmRole, isOpen: false })}
        onConfirm={() => confirmRole.userId && toggleRole(confirmRole.userId, confirmRole.currentRole)}
        title="Elevate/Demote Identity"
        message={`Are you sure you want to change the clearance level for "${confirmRole.name}" to ${confirmRole.currentRole === 'admin' ? 'User' : 'Admin'}?`}
        confirmText="Execute Change"
        type="warning"
      />

      {/* Delete Confirmation */}
      <AdminConfirmDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={() => confirmDelete.userId && handleDeleteUser(confirmDelete.userId)}
        title="Purge User Identity"
        message={`Warning: You are about to permanently erase the user identity for "${confirmDelete.name}". This action cannot be undone and will terminate all account access.`}
        confirmText="Confirm Purge"
      />
    </div>
  );
};

export default AdminUsers;
