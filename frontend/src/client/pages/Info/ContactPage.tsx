
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSent, setIsSent] = useState(false);
  const [cmsContent, setCmsContent] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/cms/contact`).then(res => res.json()).then(data => setCmsContent(data)).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">{cmsContent?.title || 'Get in Touch'}</h1>
        {cmsContent ? (
          <div className="prose prose-slate max-w-2xl mx-auto text-gray-500 text-lg mb-8" dangerouslySetInnerHTML={{ __html: cmsContent.content }} />
        ) : (
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Have a question or need help with an order? Our team is here for you 24/7.</p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z"/></svg>
             </div>
             <h3 className="font-bold text-slate-900 mb-2">Email Us</h3>
             <p className="text-gray-500 text-sm">Our friendly team is here to help.</p>
             <p className="text-indigo-600 font-bold mt-2">hello@fauda.com</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
             </div>
             <h3 className="font-bold text-slate-900 mb-2">Office</h3>
             <p className="text-gray-500 text-sm">Come say hello at our HQ.</p>
             <p className="text-slate-900 font-medium mt-2">123 Tech Park, Innovation Way, CA</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
             <h3 className="font-bold text-slate-900 mb-2">Working Hours</h3>
             <p className="text-gray-500 text-sm">We're online and ready.</p>
             <p className="text-slate-900 font-medium mt-2">Mon-Fri: 9am - 6pm EST</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl shadow-indigo-500/5">
            {isSent ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                <p className="text-gray-500">We'll get back to you within 24 hours.</p>
                <button onClick={() => setIsSent(false)} className="mt-8 text-indigo-600 font-bold hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" required className="checkout-input" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" required className="checkout-input" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                  <select className="checkout-input bg-white appearance-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                    <option value="">Select a reason</option>
                    <option value="order">Order Support</option>
                    <option value="product">Product Question</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                  <textarea required className="checkout-input min-h-[150px] resize-none" placeholder="How can we help?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98]">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
