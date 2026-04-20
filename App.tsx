
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
const AdminHomepageControl = lazy(() => import('./admin/pages/AdminHomepageControl'));
const AdminPayments = lazy(() => import('./admin/pages/AdminPayments'));
const AdminDevices = lazy(() => import('./admin/pages/AdminDevices'));
const AdminPOS = lazy(() => import('./admin/pages/AdminPOS'));
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

// Define mapping for Homepage component loading
const SectionComponents: Record<string, React.FC> = {
  Hero: Hero,
  TabbedProductShowcase: TabbedProductShowcase,
  StorySection: StorySection,
  TrustSection: TrustSection,
  Categories: ShopByCategory
};

const CategoryHighlight: React.FC<{ category: string }> = ({ category }) => {
  const { products } = useApp();
  const catProducts = products.filter(p => p.category === category).slice(0, 4);

  if (catProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{category}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Curated selection from our fleet</p>
        </div>
        <Link to={`/category/${category.toLowerCase().replace(/ /g, '-')}`} className="text-xs font-black text-slate-900 uppercase border-b-2 border-slate-900 pb-1">View All</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {catProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  const { products } = useApp();
  const [layout, setLayout] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/cms/homepage-layout')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.content) {
          try {
            setLayout(JSON.parse(data.content));
          } catch (e) {
            setLayout([]);
          }
        }
      });
  }, []);

  const renderSection = (section: any) => {
    if (!section.visible) return null;

    switch (section.type) {
      case 'component':
        const Component = SectionComponents[section.id];
        return Component ? <Component key={section.id} /> : null;
      
      case 'category':
        return <CategoryHighlight key={section.id} category={section.data?.category} />;
      
      case 'banner':
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 py-10">
            <Link to={section.data?.link || '#'}>
               <div className="w-full h-[300px] md:h-[500px] rounded-[3rem] overflow-hidden relative group shadow-2xl">
                  <img src={section.data?.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={section.label} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-12 left-12">
                     <h3 className="text-white text-4xl font-black uppercase tracking-tight mb-4">{section.label}</h3>
                     <span className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px]">Explore Collection</span>
                  </div>
               </div>
            </Link>
          </section>
        );

      case 'html':
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 py-10" dangerouslySetInnerHTML={{ __html: section.data?.html || '' }} />
        );

      default:
        // Legacy fallback
        const LegacyComp = SectionComponents[section.id];
        return LegacyComp ? <LegacyComp key={section.id} /> : null;
    }
  };

  const finalLayout = layout.length > 0 ? layout : [
    { id: 'Hero', type: 'component', visible: true, order: 1 },
    { id: 'TabbedProductShowcase', type: 'component', visible: true, order: 2 },
    { id: 'StorySection', type: 'component', visible: true, order: 3 },
    { id: 'Categories', type: 'component', visible: true, order: 4 },
    { id: 'TrustSection', type: 'component', visible: true, order: 5 }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      {finalLayout.sort((a,b) => a.order - b.order).map(section => renderSection(section))}
    </div>
  );
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
