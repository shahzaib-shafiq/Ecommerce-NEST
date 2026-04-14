import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProductList = lazy(() => import('./pages/products/ProductList'));
const ProductForm = lazy(() => import('./pages/products/ProductForm'));
const ProductDetail = lazy(() => import('./pages/products/ProductDetail'));
const CategoryList = lazy(() => import('./pages/categories/CategoryList'));
const OrderList = lazy(() => import('./pages/orders/OrderList'));
const OrderCreate = lazy(() => import('./pages/orders/OrderCreate'));
const OrderDetail = lazy(() => import('./pages/orders/OrderDetail'));
const CartPage = lazy(() => import('./pages/cart/CartPage'));
const StoreList = lazy(() => import('./pages/stores/StoreList'));
const UserList = lazy(() => import('./pages/users/UserList'));
const PaymentList = lazy(() => import('./pages/payments/PaymentList'));
const CouponList = lazy(() => import('./pages/coupons/CouponList'));
const ShippingList = lazy(() => import('./pages/shipping/ShippingList'));
const AddressList = lazy(() => import('./pages/addresses/AddressList'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', background: '#1f2937', color: '#fff', fontSize: '14px' },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/new" element={<OrderCreate />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="stores" element={<StoreList />} />
              <Route path="users" element={<UserList />} />
              <Route path="payments" element={<PaymentList />} />
              <Route path="coupons" element={<CouponList />} />
              <Route path="shipping" element={<ShippingList />} />
              <Route path="addresses" element={<AddressList />} />
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
