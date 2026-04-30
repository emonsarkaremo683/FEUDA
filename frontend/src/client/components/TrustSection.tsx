
import React from 'react';

const TrustSection: React.FC = () => {
  const benefits = [
    {
      title: 'Premium Quality',
      desc: 'Selected durable materials',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
    },
    {
      title: 'Secure Checkout',
      desc: '100% encryption protected',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
    },
    {
      title: 'Fast Delivery',
      desc: 'Global shipping in 3-5 days',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
    },
    {
      title: '30-Day Returns',
      desc: 'Hassle-free money back',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"/></svg>
    }
  ];

  return (
    <section className="bg-white py-12 border-y">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-1">
              {item.icon}
            </div>
            <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
            <p className="text-gray-500 text-xs">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustSection;
