
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './client/components/Navbar';
import Hero from './client/components/Hero';
import ProductCard from './client/components/ProductCard';
import TrustSection from './client/components/TrustSection';
import Footer from './client/components/Footer';
import Toast from './client/components/Toast';
import AnnouncementBar from './client/components/AnnouncementBar';
import TabbedProductShowcase from './client/components/TabbedProductShowcase';
import StorySection from './client/components/StorySection';
import ShopByCategory from './client/components/ShopByCategory';
import HomePage from './client/pages/HomePage';



// Lazy loading Client Pages
const ProductListingPage = lazy(() => import('./client/pages/ProductListingPage'));
const ProductDetailPage = lazy(() => import('./client/pages/ProductDetailPage'));
const CartPage = lazy(() => import('./client/pages/CartPage'));
const TrackOrder = lazy(() => import('./client/pages/TrackOrder'));
const FavoritesPage = lazy(() => import('./client/pages/FavoritesPage'));
const CheckoutPage = lazy(() => import('./client/pages/CheckoutPage'));
const LoginPage = lazy(() => import('./client/pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./client/pages/Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./client/pages/Auth/ForgotPasswordPage'));
const Dashboard = lazy(() => import('./client/pages/Dashboard/Dashboard'));
const OrderDetailsPage = lazy(() => import('./client/pages/Dashboard/OrderDetailsPage'));
const ContactPage = lazy(() => import('./client/pages/Info/ContactPage'));
const FAQPage = lazy(() => import('./client/pages/Info/FAQPage'));
const PolicyPage = lazy(() => import('./client/pages/Info/PolicyPage'));

// Lazy loading Admin Pages
const AdminLayout = lazy(() => import('./admin/pages/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminOrders = lazy(() => import('./admin/pages/AdminOrders'));
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'));
const AdminInventory = lazy(() => import('./admin/pages/AdminInventory'));
const AdminUsers = lazy(() => import('./admin/pages/AdminUsers'));
const AdminAnalytics = lazy(() => import('./admin/pages/AdminAnalytics'));
const AdminCategories = lazy(() => import('./admin/pages/AdminCategories'));
const AdminCMS = lazy(() => import('./admin/pages/AdminCMS'));
const AdminMenus = lazy(() => import('./admin/pages/AdminMenus'));
const AdminAnnouncements = lazy(() => import('./admin/pages/AdminAnnouncements'));
import AdminHomepageControl from './admin/pages/AdminHomepageControl';
const AdminPayments = lazy(() => import('./admin/pages/AdminPayments'));
const AdminDevices = lazy(() => import('./admin/pages/AdminDevices'));
const AdminERP = lazy(() => import('./admin/pages/AdminERP'));

const FullPageLoader = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ children, requireAdmin = false }) => {
  const { user, token } = useApp();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPath && <AnnouncementBar />}
      {!isAdminPath && <Navbar />}
      <div className="flex-grow">
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:categoryId" element={<ProductListingPage />} />
            <Route path="/search" element={<ProductListingPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/policy/:type" element={<PolicyPage />} />
            <Route path="/cms/:type" element={<PolicyPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="cms" element={<AdminCMS />} />
              <Route path="menus" element={<AdminMenus />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="homepage" element={<AdminHomepageControl />} />
              <Route path="devices" element={<AdminDevices />} />
              <Route path="erp" element={<AdminERP />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
      {!isAdminPath && <Footer />}
      <Toast />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
