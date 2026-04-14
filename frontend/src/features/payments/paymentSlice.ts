import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Payment } from '../../types';

interface PaymentState {
  items: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = { items: [], loading: false, error: null };

export const fetchPayments = createAsyncThunk('payments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Payment[]>('/payments');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch payments');
  }
});

export const createPayment = createAsyncThunk('payments/create', async (payment: Partial<Payment>, { rejectWithValue }) => {
  try {
    const { data } = await api.post<Payment>('/payments', payment);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create payment');
  }
});

export const updatePaymentStatus = createAsyncThunk(
  'payments/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<Payment>(`/payments/${id}/status`, { status });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update payment status');
    }
  },
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPayments.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchPayments.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createPayment.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default paymentSlice.reducer;
