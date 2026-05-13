
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShippingInfo, PaymentMethodType } from '../../types';
import PurchaseSlip from '../components/PurchaseSlip';

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'success';

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, placeOrder } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showSlip, setShowModal] = useState(false);

  // ... rest of form states ...

  const handlePlaceOrder = async () => {
    try {
      const order = await placeOrder(shippingInfo, paymentMethod, paymentDetails);
      setLastOrder(order);
      setStep('success');
    } catch (err) {
      alert('Order placement failed. Please try again.');
    }
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="max-w-xl mx-auto py-32 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty.</h2>
        <Link to="/" className="text-blue-600 font-bold hover:underline">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {step !== 'success' && (
        <div className="flex flex-wrap items-center justify-center mb-16 sm:mb-20 gap-y-10 px-4">
          {['shipping', 'payment', 'review'].map((s, idx) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center relative group">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-50' : 
                  (idx < ['shipping', 'payment', 'review'].indexOf(step) ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-gray-100 text-gray-400')
                }`}>
                  {idx < ['shipping', 'payment', 'review'].indexOf(step) ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  ) : idx + 1}
                </div>
                <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300`}>
                  <span className={`text-[10px] sm:text-xs uppercase font-black tracking-widest whitespace-nowrap ${step === s ? 'text-blue-600' : 'text-gray-400'}`}>
                    {s}
                  </span>
                </div>
              </div>
              {idx < 2 && (
                <div className={`h-1 flex-1 min-w-[30px] sm:min-w-[80px] max-w-[120px] mx-1 sm:mx-4 rounded-full transition-all duration-1000 ${idx < ['shipping', 'payment', 'review'].indexOf(step) ? 'bg-green-500 shadow-sm shadow-green-500/20' : 'bg-gray-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-12">
        {step === 'success' ? (
          <div className="lg:col-span-3 py-12 text-center animate-fade-in">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Order Confirmed!</h1>
            <p className="text-gray-500 mb-2">Thank you for your purchase, {lastOrder?.shipping.fullName}.</p>
            <p className="text-blue-600 font-bold mb-8">Order ID: {lastOrder?.id}</p>
            <div className="max-w-md mx-auto bg-white rounded-3xl p-6 border mb-12 text-left">
               <h3 className="font-bold mb-4">Shipping to:</h3>
               <p className="text-sm text-gray-600">{lastOrder?.shipping.address}, {lastOrder?.shipping.area}</p>
               <p className="text-sm text-gray-600">{lastOrder?.shipping.city} - {lastOrder?.shipping.postalCode}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setShowModal(true)} 
                className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                View Purchase Slip
              </button>
              <button onClick={() => navigate('/')} className="w-full sm:w-auto bg-slate-100 text-slate-900 px-10 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                Back to Home
              </button>
            </div>

            {showSlip && lastOrder && (
              <PurchaseSlip order={lastOrder} onClose={() => setShowModal(false)} />
            )}
          </div>
        ) : (
          <>
            <div className="lg:col-span-2 space-y-8">
              {step === 'shipping' && (
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8">
                  <h2 className="text-2xl font-black text-slate-900">Shipping Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name" className="checkout-input" value={shippingInfo.fullName} onChange={e => setShippingInfo({...shippingInfo, fullName: e.target.value})} />
                    <input type="text" placeholder="Phone Number" className="checkout-input" value={shippingInfo.phone} onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})} />
                    <input type="email" placeholder="Email Address (Optional)" className="checkout-input sm:col-span-2" value={shippingInfo.email} onChange={e => setShippingInfo({...shippingInfo, email: e.target.value})} />
                    <input type="text" placeholder="Address" className="checkout-input sm:col-span-2" value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                      <input type="text" placeholder="City" className="checkout-input" value={shippingInfo.city} onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})} />
                      <input type="text" placeholder="Area" className="checkout-input" value={shippingInfo.area} onChange={e => setShippingInfo({...shippingInfo, area: e.target.value})} />
                    </div>
                    <input type="text" placeholder="Postal Code" className="checkout-input sm:col-span-2" value={shippingInfo.postalCode} onChange={e => setShippingInfo({...shippingInfo, postalCode: e.target.value})} />
                    <textarea placeholder="Delivery Note (Optional)" className="checkout-input sm:col-span-2 min-h-[100px]" value={shippingInfo.note} onChange={e => setShippingInfo({...shippingInfo, note: e.target.value})} />
                  </div>
                  <button onClick={() => setStep('payment')} className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98]">
                    Continue to Payment
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Payment Method</h2>
                    <button onClick={() => setStep('shipping')} className="text-blue-600 text-sm font-bold hover:underline">Edit Shipping</button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'COD', name: 'Cash on Delivery', icon: '💵' },
                      { id: 'bKash', name: 'bKash', icon: '📱' },
                      { id: 'Nagad', name: 'Nagad', icon: '📱' },
                      { id: 'SSLCommerz', name: 'SSLCommerz', icon: '🌐' },
                      { id: 'Bank', name: 'Bank Transfer', icon: '🏦' },
                      { id: 'Card', name: 'Debit/Credit Card', icon: '💳' }
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as PaymentMethodType)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center ${paymentMethod === method.id ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <span className="text-xs font-bold text-slate-900 leading-tight">{method.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200">
                    {paymentMethod === 'COD' && <p className="text-sm text-gray-600">Pay with cash when your package is delivered. Please keep the exact change ready.</p>}
                    {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && (
                      <div className="space-y-4">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Send Money to: 01700-000000</p>
                        <input type="text" placeholder={`${paymentMethod} Number`} className="checkout-input bg-white" value={paymentDetails.phone} onChange={e => setPaymentDetails({...paymentDetails, phone: e.target.value})} />
                        <input type="text" placeholder="Transaction ID" className="checkout-input bg-white" value={paymentDetails.transactionId} onChange={e => setPaymentDetails({...paymentDetails, transactionId: e.target.value})} />
                      </div>
                    )}
                    {paymentMethod === 'Card' && (
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Cardholder Name" className="checkout-input bg-white col-span-2" value={paymentDetails.cardName} onChange={e => setPaymentDetails({...paymentDetails, cardName: e.target.value})} />
                        <input type="text" placeholder="Card Number" className="checkout-input bg-white col-span-2" value={paymentDetails.cardNumber} onChange={e => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})} />
                        <input type="text" placeholder="MM/YY" className="checkout-input bg-white" value={paymentDetails.expiry} onChange={e => setPaymentDetails({...paymentDetails, expiry: e.target.value})} />
                        <input type="text" placeholder="CVV" className="checkout-input bg-white" value={paymentDetails.cvv} onChange={e => setPaymentDetails({...paymentDetails, cvv: e.target.value})} />
                      </div>
                    )}
                  </div>

                  <button onClick={() => setStep('review')} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                    Review Order
                  </button>
                </div>
              )}

              {step === 'review' && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Review & Confirm</h2>
                    <button onClick={() => setStep('payment')} className="text-blue-600 text-sm font-bold hover:underline">Change Payment</button>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shipping To</h4>
                      <p className="text-slate-900 font-bold">{shippingInfo.fullName}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{shippingInfo.address}, {shippingInfo.area}, {shippingInfo.city}</p>
                      <p className="text-sm text-gray-600">{shippingInfo.phone}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Method</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💳</span>
                        <p className="text-slate-900 font-bold">{paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-8">
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Items Summary</h4>
                     <div className="space-y-4">
                       {cart.map(item => (
                         <div key={item.id} className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden border">
                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-slate-900">{item.name}</p>
                               <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                             </div>
                           </div>
                           <span className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                         </div>
                       ))}
                     </div>
                  </div>

                  <button onClick={handlePlaceOrder} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-green-600 transition-all shadow-xl hover:shadow-green-500/20 active:scale-[0.98]">
                    Confirm Order & Pay ${total.toFixed(2)}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm sticky top-24">
                <h2 className="text-xl font-extrabold text-slate-900 mb-6">Summary</h2>
                <div className="space-y-4 text-sm font-medium mb-8">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-slate-900 font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-bold' : 'text-slate-900 font-bold'}>
                      {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-slate-900 font-bold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between text-xl font-black text-slate-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
