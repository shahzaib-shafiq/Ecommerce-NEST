import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Cart } from '../../types';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = { cart: null, loading: false, error: null };

export const fetchCart = createAsyncThunk('cart/fetch', async (userId: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Cart>(`/cart/user/${userId}`);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
  }
});

export const createCart = createAsyncThunk('cart/create', async (userId: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post<Cart>('/cart', { userId });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create cart');
  }
});

export const addCartItem = createAsyncThunk(
  'cart/addItem',
  async (item: { cartId: string; productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      await api.post('/cart/item', item);
      const { data } = await api.get<Cart>(`/cart/user/${item.cartId}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add item');
    }
  },
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity, userId }: { itemId: string; quantity: number; userId: string }, { rejectWithValue }) => {
    try {
      await api.patch(`/cart/item/${itemId}`, { quantity });
      const { data } = await api.get<Cart>(`/cart/user/${userId}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update item');
    }
  },
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async ({ itemId, userId }: { itemId: string; userId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/item/${itemId}`);
      const { data } = await api.get<Cart>(`/cart/user/${userId}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  },
);

export const clearCart = createAsyncThunk('cart/clear', async (cartId: string, { rejectWithValue }) => {
  try {
    await api.delete(`/cart/clear/${cartId}`);
    return cartId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createCart.fulfilled, (state, action) => { state.cart = action.payload; })
      .addCase(addCartItem.fulfilled, (state, action) => { state.cart = action.payload; })
      .addCase(updateCartItem.fulfilled, (state, action) => { state.cart = action.payload; })
      .addCase(removeCartItem.fulfilled, (state, action) => { state.cart = action.payload; })
      .addCase(clearCart.fulfilled, (state) => { if (state.cart) state.cart.items = []; });
  },
});

export default cartSlice.reducer;
