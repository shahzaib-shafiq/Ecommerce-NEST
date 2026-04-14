import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchShippings, createShipping, updateShipping } from '../../features/shipping/shippingSlice';
import { fetchOrders } from '../../features/orders/orderSlice';
import { fetchAddresses } from '../../features/addresses/addressSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import { ShippingStatus } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

const createShippingSchema = Yup.object({
  orderId: Yup.string().uuid('Invalid order').required('Order is required'),
  provider: Yup.string().required('Provider is required'),
  trackingNumber: Yup.string(),
  addressId: Yup.string(),
});

const historySchema = Yup.object({
  status: Yup.string().oneOf(Object.values(ShippingStatus), 'Invalid status').required('Status is required'),
  location: Yup.string(),
  note: Yup.string(),
});

export default function ShippingList() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.shipping);
  const { items: orders } = useAppSelector((s) => s.orders);
  const { items: addresses } = useAppSelector((s) => s.addresses);
  const user = useAppSelector((s) => s.auth.user);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyShippingId, setHistoryShippingId] = useState('');

  useEffect(() => {
    dispatch(fetchShippings());
    dispatch(fetchOrders());
    if (user?.id) dispatch(fetchAddresses(user.id));
  }, [dispatch, user?.id]);

  const openStatusModal = (id: string) => { setSelectedId(id); setNewStatus(''); setStatusModalOpen(true); };
  const handleStatusUpdate = async () => {
    if (!selectedId || !newStatus) { toast.error('Please select a status'); return; }
    const r = await dispatch(updateShipping({ id: selectedId, status: newStatus as ShippingStatus }));
    if (updateShipping.fulfilled.match(r)) toast.success('Shipping status updated to ' + newStatus.replace(/_/g, ' '));
    else toast.error((r.payload as string) || 'Failed to update shipping status');
    setStatusModalOpen(false);
  };

  const createFormik = useFormik({
    initialValues: { orderId: '', provider: '', trackingNumber: '', addressId: '' },
    validationSchema: createShippingSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const r = await dispatch(createShipping({ orderId: values.orderId, provider: values.provider, trackingNumber: values.trackingNumber || undefined, addressId: values.addressId || undefined }));
      setSubmitting(false);
      if (createShipping.fulfilled.match(r)) { toast.success(`Shipment created via ${values.provider}`); setCreateModalOpen(false); resetForm(); }
      else toast.error((r.payload as string) || 'Failed to create shipment. One shipment per order allowed.');
    },
  });

  const historyFormik = useFormik({
    initialValues: { status: '', location: '', note: '' },
    validationSchema: historySchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await api.post('/shipping/history', { shippingId: historyShippingId, status: values.status, location: values.location || undefined, note: values.note || undefined });
        setSubmitting(false);
        toast.success('Shipping history entry added');
        setHistoryModalOpen(false);
        resetForm();
        dispatch(fetchShippings());
      } catch (err: any) {
        setSubmitting(false);
        toast.error(err.response?.data?.message || 'Failed to add history entry');
      }
    },
  });

  const openHistoryModal = (shippingId: string) => { setHistoryShippingId(shippingId); historyFormik.resetForm(); setHistoryModalOpen(true); };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cf = (fk: any, n: string) => ({ error: fk.errors?.[n], touched: fk.touched?.[n] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ccls = (fk: any, n: string) => `input-field ${fk.touched?.[n] && fk.errors?.[n] ? 'border-red-400' : ''}`;

  if (loading && items.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Shipping</h1><p className="mt-1 text-sm text-gray-500">{items.length} shipments</p></div>
        <button onClick={() => { createFormik.resetForm(); setCreateModalOpen(true); }} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Create Shipment
        </button>
      </div>

      <div className="card">
        {items.length === 0 ? (
          <EmptyState title="No shipments" description="Create a shipment for an order" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100"><th className="table-header">Shipping ID</th><th className="table-header">Order</th><th className="table-header">Provider</th><th className="table-header">Tracking</th><th className="table-header">Status</th><th className="table-header">Date</th><th className="table-header text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="table-cell font-mono text-xs text-gray-500">{s.id.slice(0, 8)}...</td>
                    <td className="table-cell font-mono text-xs text-indigo-600">{s.orderId.slice(0, 8)}...</td>
                    <td className="table-cell font-medium text-gray-900">{s.provider}</td>
                    <td className="table-cell text-xs text-gray-500 font-mono">{s.trackingNumber || '—'}</td>
                    <td className="table-cell"><StatusBadge status={s.status} /></td>
                    <td className="table-cell text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openHistoryModal(s.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600" title="Add history">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        </button>
                        <button onClick={() => openStatusModal(s.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Update status">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Shipping Status">
        <div className="space-y-4">
          <FormField label="New Status" error={undefined} touched={false}>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field">
              <option value="">Select status</option>
              {Object.values(ShippingStatus).map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </FormField>
          <div className="flex gap-3">
            <button onClick={handleStatusUpdate} disabled={!newStatus} className="btn-primary">Update</button>
            <button onClick={() => setStatusModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Create Shipping Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Shipment" wide>
        <form onSubmit={createFormik.handleSubmit} className="space-y-4">
          <FormField label="Order" {...cf(createFormik, 'orderId')}>
            <select {...createFormik.getFieldProps('orderId')} className={ccls(createFormik, 'orderId')}>
              <option value="">Select order</option>
              {orders.map((o) => <option key={o.id} value={o.id}>#{o.id.slice(0, 8)}... — PKR {o.total.toLocaleString()} ({o.status})</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Provider" {...cf(createFormik, 'provider')}>
              <input {...createFormik.getFieldProps('provider')} className={ccls(createFormik, 'provider')} placeholder="e.g. TCS, Leopards" />
            </FormField>
            <FormField label="Tracking Number (optional)" {...cf(createFormik, 'trackingNumber')}>
              <input {...createFormik.getFieldProps('trackingNumber')} className={ccls(createFormik, 'trackingNumber')} placeholder="e.g. TRK-12345678" />
            </FormField>
          </div>
          <FormField label="Delivery Address (optional)" {...cf(createFormik, 'addressId')}>
            <select {...createFormik.getFieldProps('addressId')} className={ccls(createFormik, 'addressId')}>
              <option value="">No address selected</option>
              {addresses.map((a) => <option key={a.id} value={a.id}>{a.line1}, {a.city}, {a.state} {a.postal}</option>)}
            </select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createFormik.isSubmitting} className="btn-primary">{createFormik.isSubmitting ? 'Creating...' : 'Create Shipment'}</button>
            <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Add History Modal */}
      <Modal open={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title="Add Shipping History">
        <form onSubmit={historyFormik.handleSubmit} className="space-y-4">
          <FormField label="Status" {...cf(historyFormik, 'status')}>
            <select {...historyFormik.getFieldProps('status')} className={ccls(historyFormik, 'status')}>
              <option value="">Select status</option>
              {Object.values(ShippingStatus).map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </FormField>
          <FormField label="Location (optional)" {...cf(historyFormik, 'location')}>
            <input {...historyFormik.getFieldProps('location')} className={ccls(historyFormik, 'location')} placeholder="e.g. Karachi Hub" />
          </FormField>
          <FormField label="Note (optional)" {...cf(historyFormik, 'note')}>
            <input {...historyFormik.getFieldProps('note')} className={ccls(historyFormik, 'note')} placeholder="e.g. Package scanned at warehouse" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={historyFormik.isSubmitting} className="btn-primary">{historyFormik.isSubmitting ? 'Adding...' : 'Add History'}</button>
            <button type="button" onClick={() => setHistoryModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
