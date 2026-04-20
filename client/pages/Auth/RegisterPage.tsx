
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';

const RegisterPage: React.FC = () => {
  const { login, socialLogin } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<{fullName?: string; email?: string; password?: string; confirm?: string; general?: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return 0;
    let strength = 0;
    if (pw.length >= 8) strength += 1;
    if (/[A-Z]/.test(pw)) strength += 1;
    if (/[0-9]/.test(pw)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pw)) strength += 1;
    return strength;
  }, [formData.password]);

  const strengthLabel = ['Too Weak', 'Weak', 'Good', 'Strong', 'Excellent'][passwordStrength];
  const strengthColor = ['bg-gray-200', 'bg-red-500', 'bg-amber-500', 'bg-indigo-500', 'bg-green-500'][passwordStrength];

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Minimum 8 characters';
    
    if (formData.password !== formData.confirm) newErrors.confirm = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: formData.fullName, email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || 'Registration failed' });
        return;
      }
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-indigo-500/5 animate-fade-in">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="FEUDA" className="h-14 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of premium accessory fans.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
              {errors.general}
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              type="text" 
              className={`checkout-input ${errors.fullName ? 'border-red-500' : ''}`}
              placeholder="Alex Rivera"
              value={formData.fullName}
              onChange={e => {setFormData({...formData, fullName: e.target.value}); if(errors.fullName) setErrors({...errors, fullName: undefined})}}
              disabled={isLoading}
            />
            {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.fullName}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              className={`checkout-input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="name@example.com"
              value={formData.email}
              onChange={e => {setFormData({...formData, email: e.target.value}); if(errors.email) setErrors({...errors, email: undefined})}}
              disabled={isLoading}
            />
            {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              className={`checkout-input ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={e => {setFormData({...formData, password: e.target.value}); if(errors.password) setErrors({...errors, password: undefined})}}
              disabled={isLoading}
            />
            {formData.password && (
              <div className="mt-3 px-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Security: {strengthLabel}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${strengthColor}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
            <input 
              type="password" 
              className={`checkout-input ${errors.confirm ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="••••••••"
              value={formData.confirm}
              onChange={e => {setFormData({...formData, confirm: e.target.value}); if(errors.confirm) setErrors({...errors, confirm: undefined})}}
              disabled={isLoading}
            />
            {errors.confirm && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.confirm}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98] disabled:bg-gray-400 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-gray-500">
            Already have an account? {' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
