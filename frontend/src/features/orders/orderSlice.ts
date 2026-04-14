import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Order } from '../../types';

interface OrderState {
  items: Order[];
  current: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = { items: [], current: null, loading: false, error: null };

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{ items: Order[] }>('/orders');
    return data.items;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch order');
  }
});

export const createOrder = createAsyncThunk(
  'orders/create',
  async (order: { userId: string; storeId: string; items: { productId: string; quantity: number }[]; couponCode?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/orders', order);
      return data.order as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create order');
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
    }
  },
);

export const deleteOrder = createAsyncThunk('orders/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/orders/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete order');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchOrder.pending, (state) => { state.loading = true; })
      .addCase(fetchOrder.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createOrder.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((o) => o.id !== action.payload);
      });
  },
});

export const { clearCurrent } = orderSlice.actions;
export default orderSlice.reducer;
