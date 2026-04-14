export type OrderStatus = 'PREORDER' | 'PENDING' | 'CHECKING' | 'READY' | 'DELIVERED';
export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name?: string | null;
  email: string;
  role: UserRole;
  phone?: string | null;
  address?: string | null;
  image?: string | null;
  createdAt?: Date | string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: Date | string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  unit: string | null;
  price: number;
  stock: number;
  isPreOrder: boolean;
  description: string | null;
  image?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  user?: User; // Changed from customer to user
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  quantity: number;
  unitPrice: number;
  product?: Product;
}

export interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
}
