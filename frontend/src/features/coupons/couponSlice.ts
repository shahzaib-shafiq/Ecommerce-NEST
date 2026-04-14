import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Coupon } from '../../types';

interface CouponState {
  items: Coupon[];
  loading: boolean;
  error: string | null;
}

const initialState: CouponState = { items: [], loading: false, error: null };

export const fetchCoupons = createAsyncThunk('coupons/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Coupon[]>('/coupons');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch coupons');
  }
});

export const createCoupon = createAsyncThunk('coupons/create', async (coupon: Partial<Coupon>, { rejectWithValue }) => {
  try {
    const { data } = await api.post<Coupon>('/coupons', coupon);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create coupon');
  }
});

export const updateCoupon = createAsyncThunk('coupons/update', async ({ id, ...coupon }: Partial<Coupon> & { id: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<Coupon>(`/coupons/${id}`, coupon);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update coupon');
  }
});

export const deleteCoupon = createAsyncThunk('coupons/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/coupons/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete coupon');
  }
});

const couponSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCoupons.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchCoupons.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createCoupon.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export default couponSlice.reducer;
