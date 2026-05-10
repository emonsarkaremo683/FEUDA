
export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ColorVariant {
  name: string;
  hex: string;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string; // Default/Thumbnail image
  images: string[]; // General additional images
  modelCompatibility: string;
  description: string;
  specifications: string[];
  isBestSeller?: boolean;
  reviews?: Review[];
  stock?: number;
  colors?: ColorVariant[]; 
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

export type Category = 'All' | 'Clear Cases' | 'MagSafe' | 'Screen Protectors' | 'Chargers' | 'Lens Guards';

export type PaymentMethodType = 'COD' | 'bKash' | 'Nagad' | 'SSLCommerz' | 'Bank' | 'Card';

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  note?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  shipping: ShippingInfo;
  payment: {
    method: PaymentMethodType;
    details?: any;
  };
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  source?: 'Online' | 'POS';
  date: string;
}

export interface Address extends ShippingInfo {
  id: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  uid: string; // Firebase User ID
  email: string;
  fullName: string;
  phone?: string;
  addresses: Address[];
  role: 'admin' | 'user';
  emailVerified: boolean; // From Firebase
}

export interface MenuItem {
  id: number;
  label: string;
  url: string | null;
  parent_id: number | null;
  position: number;
  is_active: boolean;
  location: string;
  layout_style: string;
}
