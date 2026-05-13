
import React from 'react';
import { Order } from '../../types';

interface PurchaseSlipProps {
  order: Order;
  onClose: () => void;
}

const PurchaseSlip: React.FC<PurchaseSlipProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static print:inset-auto">
      {/* Backdrop for click to close - hidden on print */}
      <div className="absolute inset-0 print:hidden" onClick={onClose} />
      
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Actions - Hidden on print */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 print:hidden">
          <h3 className="font-black text-slate-900 uppercase tracking-tight">Purchase Slip</h3>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              Print / PDF
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-slate-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Slip Content */}
        <div className="p-10 sm:p-16 overflow-y-auto flex-grow print:p-8" id="printable-slip">
          {/* Header */}
          <div className="flex justify-between items-start mb-12 border-b border-gray-100 pb-8">
            <div>
               <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2 italic">FEUDA<span className="text-indigo-600 text-base align-top ml-1">TECH</span></h1>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Premium Digital Assets</p>
            </div>
            <div className="text-right">
               <h2 className="text-xl font-black text-slate-900 uppercase">Invoice</h2>
               <p className="text-xs text-gray-500 font-bold mt-1">#{order.id}</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">{new Date(order.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
             <div>
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Billing To</h4>
                <p className="font-bold text-slate-900">{order.shipping.fullName}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                   {order.shipping.address}, {order.shipping.area}<br/>
                   {order.shipping.city} - {order.shipping.postalCode}<br/>
                   Ph: {order.shipping.phone}
                </p>
             </div>
             <div className="text-right">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Payment Info</h4>
                <p className="font-bold text-slate-900">{order.paymentMethod}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Status: Confirmed</p>
             </div>
          </div>

          {/* Table */}
          <table className="w-full mb-12">
             <thead>
                <tr className="border-y border-gray-100">
                   <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Description</th>
                   <th className="text-center py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                   <th className="text-right py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {order.items.map(item => (
                  <tr key={item.id}>
                     <td className="py-6">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-gray-400 mt-1 italic">SKU: PRC-{item.id}</p>
                     </td>
                     <td className="py-6 text-center text-sm font-bold text-slate-600">{item.quantity}</td>
                     <td className="py-6 text-right font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
             </tbody>
          </table>

          {/* Footer Totals */}
          <div className="flex justify-end border-t-2 border-slate-900 pt-8">
             <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm font-bold text-gray-500">
                   <span>Subtotal</span>
                   <span className="text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-500">
                   <span>Shipping</span>
                   <span className="text-slate-900">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-500">
                   <span>Tax (8%)</span>
                   <span className="text-slate-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-indigo-600 pt-3 border-t border-gray-100">
                   <span>TOTAL</span>
                   <span>${total.toFixed(2)}</span>
                </div>
             </div>
          </div>

          <div className="mt-20 text-center">
             <div className="inline-block p-1 bg-gray-50 rounded-lg mb-4">
                <div className="border border-dashed border-gray-200 px-8 py-2">
                   <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">Authorized Seal</span>
                </div>
             </div>
             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Thank you for choosing Feuda Tech for your digital lifestyle.</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-slip, #printable-slip * { visibility: visible; }
          #printable-slip { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
    </div>
  );
};

export default PurchaseSlip;
