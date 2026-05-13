
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      let message = 'Failed to send reset email.';
      if (err.code === 'auth/user-not-found') message = 'No account found with this email.';
      else if (err.code === 'auth/invalid-email') message = 'Invalid email address.';
      else if (err.message) message = err.message;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-blue-500/5 animate-fade-in">
        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Forgot Password?</h1>
              <p className="text-gray-500 text-sm mt-1">No worries, we'll send you reset instructions.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-500/10 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
            <p className="text-gray-500 text-sm mt-2 mb-8">We've sent a password reset link to <br/><span className="font-bold text-slate-900">{email}</span></p>
            <button 
              onClick={() => setIsSubmitted(false)} 
              className="text-blue-600 font-bold hover:underline"
              disabled={isLoading}
            >
              Didn't receive it? Click to resend
            </button>
          </div>
        )}

        <div className="mt-8 pt-8 border-t text-center">
          <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7"/></svg>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
