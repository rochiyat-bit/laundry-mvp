export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'WASHING'
  | 'DRYING'
  | 'IRONING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  unit: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  service: Service;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  qrCode?: string;
  trackingUrl?: string;
  pickupDate?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
