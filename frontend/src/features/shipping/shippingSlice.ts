import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Shipping } from '../../types';

interface ShippingState {
  items: Shipping[];
  current: Shipping | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShippingState = { items: [], current: null, loading: false, error: null };

export const fetchShippings = createAsyncThunk('shipping/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Shipping[]>('/shipping');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch shipments');
  }
});

export const fetchShipping = createAsyncThunk('shipping/fetchOne', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Shipping>(`/shipping/${id}`);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch shipment');
  }
});

export const createShipping = createAsyncThunk('shipping/create', async (shipping: Partial<Shipping>, { rejectWithValue }) => {
  try {
    const { data } = await api.post<Shipping>('/shipping', shipping);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create shipment');
  }
});

export const updateShipping = createAsyncThunk('shipping/update', async ({ id, ...shipping }: Partial<Shipping> & { id: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<Shipping>(`/shipping/${id}`, shipping);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update shipment');
  }
});

const shippingSlice = createSlice({
  name: 'shipping',
  initialState,
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShippings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchShippings.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchShippings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchShipping.fulfilled, (state, action) => { state.current = action.payload; })
      .addCase(createShipping.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateShipping.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      });
  },
});

export const { clearCurrent } = shippingSlice.actions;
export default shippingSlice.reducer;
