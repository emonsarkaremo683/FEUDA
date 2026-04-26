
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem, Order, ShippingInfo, PaymentMethodType, User, Address, MenuItem } from '../types';
import { products as mockProducts, CATEGORY_NAMES } from '../data/products'; // Keep as fallback

interface AppContextType {
  products: Product[];
  refreshProducts: () => Promise<void>;
  menus: MenuItem[];
  refreshMenus: () => Promise<void>;
  categories: any[];
  refreshCategories: () => Promise<void>;
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  user: User | null;
  selectedDevice: string;
  setSelectedDevice: (device: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  addToCart: (product: Product, quantity?: number, color?: string) => void;
  buyNow: (product: Product, quantity?: number, color?: string) => void;
  updateCartQuantity: (productId: string, delta: number, color?: string) => void;
  removeFromCart: (productId: string, color?: string) => void;
  toggleWishlist: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (shipping: ShippingInfo, paymentMethod: PaymentMethodType, paymentDetails: any) => Order | Promise<Order>;
  login: (userData: User, token: string) => void;
  token: string | null;
  socialLogin: (provider: 'Google' | 'Facebook') => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id' | 'isDefault'>) => void;
  removeAddress: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cartCount: number;
  wishlistCount: number;
  cartTotal: number;
  toast: { message: string; visible: boolean } | null;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('fauda_local_categories');
      return saved ? JSON.parse(saved) : CATEGORY_NAMES;
    } catch (e) { return CATEGORY_NAMES; }
  });
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>(() => {
    return localStorage.getItem('fauda_device') || 'all';
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('fauda_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('fauda_token');
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('fauda_remember') === 'true';
  });
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  const refreshCategories = React.useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
         const data = await response.json();
         if (Array.isArray(data) && data.length > 0) {
           const names = data.map((c: any) => c.name);
           setCategories(names);
           localStorage.setItem('fauda_local_categories', JSON.stringify(names));
         }
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    refreshCategories();
  }, []);

  const refreshProducts = React.useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const dbProducts = await response.json();
        if (Array.isArray(dbProducts)) {
          const formattedProducts: Product[] = dbProducts.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            category: p.category,
            price: parseFloat(p.price),
            image: p.image_url, 
            images: [p.image_url], 
            modelCompatibility: p.model_compatibility || 'All Models',
            description: p.description,
            specifications: ['Premium Quality'],
            stock: p.stock,
            isBestSeller: !!p.is_best_seller,
            colors: p.colors ? JSON.parse(p.colors) : []
          }));
          
          setProducts(formattedProducts);
          localStorage.setItem('fauda_local_products', JSON.stringify(formattedProducts));
        }
      }
    } catch (error) {
      console.log("Using offline data");
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshMenus = React.useCallback(async () => {
    try {
      const response = await fetch('/api/menus');
      if (response.ok) {
        const dbMenus = await response.json();
        setMenus(dbMenus);
      }
    } catch (err) {
      console.warn("Failed to fetch menus");
    }
  }, []);

  useEffect(() => {
    refreshMenus();
  }, []);

  useEffect(() => {
    localStorage.setItem('fauda_device', selectedDevice);
  }, [selectedDevice]);

  useEffect(() => {
    if (rememberMe && user && token) {
      localStorage.setItem('fauda_user', JSON.stringify(user));
      localStorage.setItem('fauda_token', token);
    } else if (!rememberMe) {
      localStorage.removeItem('fauda_user');
      localStorage.removeItem('fauda_token');
    }
    localStorage.setItem('fauda_remember', rememberMe.toString());
  }, [user, token, rememberMe]);

  useEffect(() => {
    const verifyToken = async () => {
       if (token) {
         try {
           const res = await fetch('/api/me', {
             headers: { 'Authorization': `Bearer ${token}` }
           });
           if (!res.ok) {
             logout();
           } else {
             const userData = await res.json();
             setUser(prev => prev ? { ...prev, role: userData.role, email: userData.email, fullName: userData.fullName } : prev);
           }
         } catch (e) {
           console.warn('Token verification failed');
         }
       }
    };
    verifyToken();
  }, [token]);

  useEffect(() => {
    if (user && token) {
      const fetchOrders = async () => {
        try {
          const endpoint = user.role === 'admin' ? '/api/orders' : '/api/orders/mine';
          const response = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const dbOrders = await response.json();
            if (Array.isArray(dbOrders)) {
              const mappedOrders: Order[] = dbOrders.map((o: any) => ({
                id: o.id,
                date: o.created_at,
                status: o.status,
                total: parseFloat(o.total),
                subtotal: parseFloat(o.subtotal),
                tax: parseFloat(o.tax),
                shippingFee: parseFloat(o.shipping_fee),
                shipping: {
                   fullName: o.full_name,
                   email: o.email,
                   phone: o.phone,
                   address: o.address,
                   city: o.city,
                   area: o.area,
                   postalCode: o.postal_code
                },
                items: [],
                payment: { method: o.payment_method }
              }));
              setOrders(mappedOrders);
            }
          }
        } catch (err) {
          console.warn('Orders fetch failed');
        }
      };
      fetchOrders();
    }
  }, [user, token]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product: Product, quantity: number = 1, color?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedColor === color);
      if (existing) {
        return prev.map(item => (item.id === product.id && item.selectedColor === color) ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity, selectedColor: color }];
    });
    showToast(`${product.name}${color ? ` (${color})` : ''} added to cart!`);
  };

  const buyNow = (product: Product, quantity: number = 1, color?: string) => {
    addToCart(product, quantity, color);
  };

  const updateCartQuantity = (productId: string, delta: number, color?: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId && item.selectedColor === color) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string, color?: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedColor === color)));
    showToast('Removed from cart');
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (shipping: ShippingInfo, method: PaymentMethodType, details: any): Promise<Order> => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingFee + tax;
    const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder: Order = { id: orderId, items: [...cart], shipping, payment: { method, details }, subtotal, tax, shippingFee, total, status: 'Processing', date: new Date().toISOString() };
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/orders', { method: 'POST', headers, body: JSON.stringify({ orderId, fullName: shipping.fullName, email: shipping.email, phone: shipping.phone, address: shipping.address, city: shipping.city, area: shipping.area, postalCode: shipping.postalCode, items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price, selectedColor: item.selectedColor })), subtotal, shippingFee, tax, total, paymentMethod: method }) });
    } catch (err) { console.warn('Backend sync failed'); }
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const login = (userData: User, userToken: string) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('fauda_token', userToken);
    if (rememberMe) localStorage.setItem('fauda_user', JSON.stringify(userData));
    showToast(userData.role === 'admin' ? `Intelligence session established.` : `Welcome, ${userData.fullName}.`);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fauda_user');
    localStorage.removeItem('fauda_token');
    showToast('Session terminated.');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
      try {
        await fetch('/api/me', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
      } catch (err) { console.warn('Profile sync failed'); }
      showToast('Profile updated');
    }
  };

  const addAddress = (addr: Omit<Address, 'id' | 'isDefault'>) => {
    if (user) {
      const newAddress: Address = { ...addr, id: Math.random().toString(36).substr(2, 9), isDefault: user.addresses.length === 0 };
      setUser({ ...user, addresses: [...user.addresses, newAddress] });
      showToast('Address added');
    }
  };

  const removeAddress = (id: string) => {
    if (user) {
      setUser({ ...user, addresses: user.addresses.filter(a => a.id !== id) });
      showToast('Address removed');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    try {
      await fetch(`/api/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status }) });
    } catch (err) { console.warn('Backend status sync failed'); }
    showToast(`Order ${orderId} status updated to ${status}`);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const isFav = prev.includes(productId);
      if (isFav) {
        showToast('Removed from favorites');
        return prev.filter(id => id !== productId);
      }
      showToast('Added to favorites');
      return [...prev, productId];
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const wishlistCount = wishlist.length;

  return (
    <AppContext.Provider value={{ 
      products, categories, menus, refreshMenus, refreshCategories,
      cart, wishlist, orders, user, token, selectedDevice, setSelectedDevice, rememberMe, setRememberMe,
      addToCart, buyNow, updateCartQuantity, removeFromCart, clearCart, placeOrder,
      login, socialLogin: () => {}, logout, updateProfile, addAddress, removeAddress, updateOrderStatus,
      toggleWishlist, cartCount, wishlistCount, cartTotal, toast, showToast, refreshProducts
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
