
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';

/**
 * NEXUS OBSIDIAN AUTH v3.1
 * Sophisticated identity verification gate.
 */

const LoginPage: React.FC = () => {
  const { login, rememberMe, setRememberMe } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email required';
    if (!password) newErrors.password = 'Cipher required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    console.log('Attempting authentication for:', email);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
         setErrors({ general: data.error || 'Identity rejection. Access denied.' });
         console.error('Auth rejection:', data.error);
      } else {
        console.log('Auth success. Identity verified as:', data.user.role);
        login(data.user, data.token);
        
        // Direct Redirection based on role
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Network/Server Fault:', err);
      setErrors({ general: 'Nexus Core link severed. Check server status.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4 relative overflow-hidden selection:bg-purple-500/30">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse"></div>

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        <div className="bg-[#161920]/80 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/5 shadow-2xl">
          <div className="text-center mb-10">
             <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-red-500 rounded-2xl flex items-center justify-center font-black text-3xl text-white mx-auto mb-6 shadow-lg shadow-purple-500/20 leading-none">F</div>
             <h1 className="text-3xl font-black text-white tracking-tight uppercase">Access Core</h1>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">Initialize Security Session</p>
          </div>

          {errors.general && (
            <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-xs font-bold animate-shake">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Identity Email</label>
              <input 
                type="email" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 transition-all outline-none placeholder:text-slate-700"
                placeholder="admin@feuda.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-[10px] font-bold ml-3">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Secret Cipher</label>
              </div>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 transition-all outline-none placeholder:text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-[10px] font-bold ml-3">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between py-2 px-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-lg bg-white/5 border-white/10 text-purple-600 focus:ring-purple-500 shadow-inner" 
                />
                <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Maintain Session</span>
              </label>
              <Link to="/forgot-password" title="Recovery" className="text-purple-400 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">Forgot Cipher?</Link>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-500/20 disabled:grayscale disabled:opacity-50 flex items-center justify-center gap-3 border border-white/5"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : 'Authenticate Access'}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-loose">
              No clearance? <br/>
              <Link to="/register" className="text-purple-400 hover:text-white transition-all underline underline-offset-8 mt-2 block">Create Digital Identity</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
