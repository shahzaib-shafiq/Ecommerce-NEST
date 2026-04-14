export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  STORE_OWNER = 'STORE_OWNER',
  STORE_MANAGER = 'STORE_MANAGER',
  CUSTOMER = 'CUSTOMER',
  DELIVERY_AGENT = 'DELIVERY_AGENT',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ShippingStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  summary?: string;
  adress?: string;
  phone?: string;
  isDeleted: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  owner?: User;
  logo?: string;
  summary?: string;
  isDeleted: boolean;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  storeId: string;
  store?: Store;
  createdById: string;
  createdBy?: User;
  categoryId?: string;
  category?: Category;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  isDeleted: boolean;
  products?: Product[];
}

export interface Cart {
  id: string;
  userId: string;
  user?: User;
  items: CartItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product?: Product;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  storeId: string;
  store?: Store;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  payments?: Payment[];
  statusHistory?: OrderStatusHistory[];
  shipping?: Shipping;
  couponUsage?: CouponUsage[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  price: number;
  quantity: number;
}

export interface Payment {
  id: string;
  orderId: string;
  order?: Order;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Shipping {
  id: string;
  orderId: string;
  order?: Order;
  provider: string;
  trackingNumber?: string;
  status: ShippingStatus;
  addressId?: string;
  address?: Address;
  history?: ShippingHistory[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingHistory {
  id: string;
  shippingId: string;
  status: ShippingStatus;
  location?: string;
  note?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  user?: User;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postal: string;
  phone?: string;
  isDeleted: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  coupon?: Coupon;
  userId: string;
  user?: User;
  orderId?: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
