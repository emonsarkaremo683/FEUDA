
import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import LazyImage from '../../components/LazyImage';
import PurchaseSlip from '../../components/PurchaseSlip';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useApp();
  const [showSlip, setShowSlip] = useState(false);
  const order = orders.find(o => o.id === orderId);

  if (!order) return <Navigate to="/dashboard" />;

  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline mb-2">
            Back to Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-extrabold text-slate-900">Order {order.id}</h1>
            <button 
              onClick={() => setShowSlip(true)}
              className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 border border-indigo-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              View Purchase Slip
            </button>
          </div>
          <p className="text-gray-500 mt-1">Placed on {new Date(order.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Order Payload</h3>
            <div className="divide-y divide-gray-50">
              {order.items.map(item => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <LazyImage src={item.image} alt={item.name} className="w-full h-full" />
                  </div>
                  <div className="flex-grow flex justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-1 italic">SKU: PRC-{item.id}</p>
                      <p className="text-[10px] font-black text-indigo-500 mt-2 uppercase tracking-widest">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Financial Summary</h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-sm font-bold opacity-60">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm font-bold opacity-60">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                 </div>
                 <div className="flex justify-between text-sm font-bold opacity-60">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                 </div>
                 <div className="pt-4 border-t border-white/10 flex justify-between text-xl font-black text-white">
                    <span>TOTAL</span>
                    <span>${total.toFixed(2)}</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Logistics Point</h3>
              <div className="space-y-4">
                 <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Destination</p>
                    <p className="text-sm font-bold text-slate-900">{order.shipping.fullName}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{order.shipping.address}</p>
                    <p className="text-xs text-gray-500">{order.shipping.city} - {order.shipping.postalCode}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Status</p>
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase">Processing</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {showSlip && (
        <PurchaseSlip order={order} onClose={() => setShowSlip(false)} />
      )}
    </div>
  );
};

export default OrderDetailsPage;
