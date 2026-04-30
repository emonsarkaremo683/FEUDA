
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import LazyImage from '../../components/LazyImage';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useApp();
  const order = orders.find(o => o.id === orderId);

  if (!order) return <Navigate to="/dashboard" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline mb-2">
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">Order {order.id}</h1>
          <p className="text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Items Summary</h3>
            <div className="divide-y">
              {order.items.map(item => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border">
                    <LazyImage src={item.image} alt={item.name} className="w-full h-full" />
                  </div>
                  <div className="flex-grow flex justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
