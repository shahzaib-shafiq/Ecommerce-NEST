import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Store } from '../../types';

interface StoreState {
  items: Store[];
  loading: boolean;
  error: string | null;
}

const initialState: StoreState = { items: [], loading: false, error: null };

export const fetchStores = createAsyncThunk('stores/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Store[]>('/stores');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stores');
  }
});

export const createStore = createAsyncThunk('stores/create', async (store: Partial<Store>, { rejectWithValue }) => {
  try {
    const { data } = await api.post<Store>('/stores', store);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create store');
  }
});

export const updateStore = createAsyncThunk('stores/update', async ({ id, ...store }: Partial<Store> & { id: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<Store>(`/stores/${id}`, store);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update store');
  }
});

export const deleteStore = createAsyncThunk('stores/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/stores/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete store');
  }
});

const storeSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStores.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchStores.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createStore.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateStore.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
      });
  },
});

export default storeSlice.reducer;
