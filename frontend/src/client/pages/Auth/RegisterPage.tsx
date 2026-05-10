
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { auth, googleProvider } from '../../../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import { API_BASE_URL } from '../../../config';

const RegisterPage: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<{fullName?: string; email?: string; password?: string; confirm?: string; general?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

  const handleFirebaseAuthentication = async (firebaseUser: any, fullName: string) => {
    const idToken = await firebaseUser.getIdToken();
    const res = await fetch(`${API_BASE_URL}/api/firebase-auth`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ uid: firebaseUser.uid, fullName, email: firebaseUser.email, emailVerified: firebaseUser.emailVerified })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Account synchronization failed');
    }
    login(data.user, data.token);
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await sendEmailVerification(userCredential.user);
      setEmailSent(true);
    } catch (err: any) {
      console.error('Registration Error:', err);
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleFirebaseAuthentication(result.user, result.user.displayName || '');
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrors({ general: 'Google sign up failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-slate-100 shadow-xl animate-fade-in text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
            <p className="text-slate-500 text-sm mt-4 leading-relaxed">
                A verification link has been sent to <span className="font-bold text-slate-900">{formData.email}</span>. 
                Please check your inbox to activate your account.
            </p>
            <div className="mt-10 pt-6 border-t border-slate-50">
                <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Back to Login</Link>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-slate-100 shadow-xl animate-fade-in">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="FEUDA" className="h-12 w-auto mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 text-sm mt-2">Join our premium community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl">
              {errors.general}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="Alex Rivera"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              disabled={isLoading}
            />
            {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="name@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              disabled={isLoading}
            />
            {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              disabled={isLoading}
            />
            {formData.password && (
              <div className="mt-3 px-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Strength: {strengthLabel}</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${strengthColor}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            {errors.password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="••••••••"
              value={formData.confirm}
              onChange={e => setFormData({...formData, confirm: e.target.value})}
              disabled={isLoading}
            />
            {errors.confirm && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.confirm}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait shadow-lg shadow-slate-200 mt-4"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or sign up with</span></div>
        </div>

        <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.31 8.82.83 10.37.83 12s.48 3.18 1.35 4.93L5.84 14.09z" fill="#FBBC05"/>
                <path d="M12 4.18c1.8-.01 3.59.62 4.9 1.94l3.12-3.12C18.15 1.51 15.22.61 12 .6 7.7 0 3.99 2.47 2.18 5.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
        </button>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account? {' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
