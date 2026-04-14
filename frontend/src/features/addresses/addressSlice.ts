import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Address } from '../../types';

interface AddressState {
  items: Address[];
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = { items: [], loading: false, error: null };

export const fetchAddresses = createAsyncThunk('addresses/fetchAll', async (userId: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Address[]>(`/address/user/${userId}`);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch addresses');
  }
});

export const createAddress = createAsyncThunk('addresses/create', async (address: Partial<Address>, { rejectWithValue }) => {
  try {
    const { data } = await api.post<Address>('/address', address);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create address');
  }
});

export const updateAddress = createAsyncThunk('addresses/update', async ({ id, ...address }: Partial<Address> & { id: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<Address>(`/address/${id}`, address);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update address');
  }
});

export const deleteAddress = createAsyncThunk('addresses/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/address/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete address');
  }
});

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAddresses.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchAddresses.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createAddress.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      });
  },
});

export default addressSlice.reducer;
