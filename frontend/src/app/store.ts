import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import categoryReducer from '../features/categories/categorySlice';
import orderReducer from '../features/orders/orderSlice';
import userReducer from '../features/users/userSlice';
import storeReducer from '../features/stores/storeSlice';
import couponReducer from '../features/coupons/couponSlice';
import cartReducer from '../features/cart/cartSlice';
import shippingReducer from '../features/shipping/shippingSlice';
import paymentReducer from '../features/payments/paymentSlice';
import addressReducer from '../features/addresses/addressSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    orders: orderReducer,
    users: userReducer,
    stores: storeReducer,
    coupons: couponReducer,
    cart: cartReducer,
    shipping: shippingReducer,
    payments: paymentReducer,
    addresses: addressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
