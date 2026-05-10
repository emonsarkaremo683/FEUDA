
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';

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

  const fetchUsers = () => {
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
    if (!window.confirm(`Elevate/Demote user to ${newRole}?`)) return;
    
    fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ role: newRole })
    }).then(() => fetchUsers());
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Identity Registry</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Authorized User Catalog</p>
        </div>
        <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
          <div className="px-4 py-2 border-r border-white/5 flex flex-col items-center">
            <span className="text-white font-black text-lg">{users.length}</span>
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Total Souls</span>
          </div>
          <div className="px-4 py-2 flex flex-col items-center">
            <span className="text-purple-500 font-black text-lg">{users.filter(u => u.role === 'admin').length}</span>
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Admins</span>
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
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-black text-white text-xs">
                        {u.fullName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{u.fullName}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {u.role} Access
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-xs font-bold">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => toggleRole(u.id, u.role)}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-400 transition-colors"
                    >
                      Permute Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
