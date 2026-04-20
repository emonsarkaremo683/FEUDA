
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import LazyImage from '../../components/LazyImage';

type Tab = 'overview' | 'orders' | 'profile' | 'addresses';

const Dashboard: React.FC = () => {
  const { user, orders, logout, wishlist } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (!user) return <Navigate to="/login" />;

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
    { id: 'orders', name: 'Orders', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg> },
    { id: 'profile', name: 'Profile', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
    { id: 'addresses', name: 'Addresses', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                {user.fullName[0]}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 truncate">{user.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === item.id 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              ))}
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-4">
                Logout
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-grow">
          <div className="animate-fade-in">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                    <p className="text-3xl font-black text-slate-900">{orders.length}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Order History</h2>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                            {order.items[0] && <LazyImage src={order.items[0].image} alt={order.items[0].name} className="w-full h-full" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none mb-1">Order {order.id}</p>
                            <p className="text-xs text-gray-500 mb-2">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Link to={`/order/${order.id}`} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all text-center">
                          View Order
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-20 text-center border">
                    <h3 className="text-xl font-bold text-slate-800">No orders found</h3>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
