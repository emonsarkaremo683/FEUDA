
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import LazyImage from '../components/LazyImage';

const CartPage: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal } = useApp();
  const shipping = cartTotal > 50 ? 0 : 9.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
           <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Your bag is empty.</h1>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Let's find something amazing for you!</p>
        <Link to="/" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-10">Shopping Bag</h1>
      
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-6 border border-gray-100 flex gap-6 animate-fade-in">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                <LazyImage src={item.image} alt={item.name} className="w-full h-full" />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg sm:text-xl leading-tight mb-1">{item.name}</h3>
                    <p className="text-blue-600 text-sm font-medium">{item.modelCompatibility}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center bg-gray-50 rounded-xl p-1">
                    <button onClick={() => updateCartQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all">-</button>
                    <span className="w-10 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all">+</button>
                  </div>
                  <span className="text-xl font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Order Summary</h2>
            <div className="space-y-4 text-sm font-medium mb-8">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-slate-900">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : 'text-slate-900'}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Tax</span>
                <span className="text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t flex justify-between text-lg font-black text-slate-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Link to="/checkout" className="block text-center w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-500/10 mb-4">
              Proceed to Checkout
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
