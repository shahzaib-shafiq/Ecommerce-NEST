import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPayments, createPayment, updatePaymentStatus } from '../../features/payments/paymentSlice';
import { fetchOrders } from '../../features/orders/orderSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import { PaymentStatus, PaymentMethod } from '../../types';
import toast from 'react-hot-toast';

const createPaymentSchema = Yup.object({
  orderId: Yup.string().uuid('Invalid order').required('Order is required'),
  amount: Yup.number().min(0, 'Must be 0 or more').required('Amount is required'),
  method: Yup.string().oneOf(Object.values(PaymentMethod), 'Invalid method').required('Payment method is required'),
  transactionId: Yup.string(),
});

export default function PaymentList() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.payments);
  const { items: orders } = useAppSelector((s) => s.orders);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => { dispatch(fetchPayments()); dispatch(fetchOrders()); }, [dispatch]);

  const openStatusModal = (id: string) => { setSelectedId(id); setNewStatus(''); setStatusModalOpen(true); };
  const handleStatusUpdate = async () => {
    if (!selectedId || !newStatus) { toast.error('Select a status'); return; }
    const r = await dispatch(updatePaymentStatus({ id: selectedId, status: newStatus }));
    if (updatePaymentStatus.fulfilled.match(r)) toast.success('Payment status updated to ' + newStatus);
    else toast.error((r.payload as string) || 'Failed to update payment status');
    setStatusModalOpen(false);
  };

  const createFormik = useFormik({
    initialValues: { orderId: '', amount: '' as unknown as number, method: PaymentMethod.CARD as string, transactionId: '' },
    validationSchema: createPaymentSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const r = await dispatch(createPayment({ orderId: values.orderId, amount: Number(values.amount), method: values.method as PaymentMethod, transactionId: values.transactionId || undefined }));
      setSubmitting(false);
      if (createPayment.fulfilled.match(r)) { toast.success('Payment created successfully'); setCreateModalOpen(false); resetForm(); }
      else toast.error((r.payload as string) || 'Failed to create payment. One payment per order allowed.');
    },
  });

  const cf = (n: string) => ({ error: (createFormik.errors as Record<string, string>)[n], touched: (createFormik.touched as Record<string, boolean>)[n] });
  const ccls = (n: string) => `input-field ${(createFormik.touched as Record<string, boolean>)[n] && (createFormik.errors as Record<string, string>)[n] ? 'border-red-400' : ''}`;

  if (loading && items.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Payments</h1><p className="mt-1 text-sm text-gray-500">{items.length} payment records</p></div>
        <button onClick={() => { createFormik.resetForm(); setCreateModalOpen(true); }} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Create Payment
        </button>
      </div>

      <div className="card">
        {items.length === 0 ? (
          <EmptyState title="No payments found" description="Create a payment for an order" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100"><th className="table-header">Payment ID</th><th className="table-header">Order</th><th className="table-header">Amount</th><th className="table-header">Method</th><th className="table-header">Status</th><th className="table-header">Transaction ID</th><th className="table-header">Date</th><th className="table-header text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="table-cell font-mono text-xs text-gray-500">{p.id.slice(0, 8)}...</td>
                    <td className="table-cell font-mono text-xs text-indigo-600">{p.orderId.slice(0, 8)}...</td>
                    <td className="table-cell font-semibold">PKR {p.amount.toLocaleString()}</td>
                    <td className="table-cell"><StatusBadge status={p.method} /></td>
                    <td className="table-cell"><StatusBadge status={p.status} /></td>
                    <td className="table-cell text-xs text-gray-500 font-mono">{p.transactionId || '—'}</td>
                    <td className="table-cell text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="table-cell text-right">
                      <button onClick={() => openStatusModal(p.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Update status">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Payment Status">
        <div className="space-y-4">
          <FormField label="New Status" error={!newStatus && statusModalOpen ? undefined : undefined} touched={false}>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field">
              <option value="">Select status</option>
              {Object.values(PaymentStatus).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <div className="flex gap-3">
            <button onClick={handleStatusUpdate} disabled={!newStatus} className="btn-primary">Update</button>
            <button onClick={() => setStatusModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Payment">
        <form onSubmit={createFormik.handleSubmit} className="space-y-4">
          <FormField label="Order" {...cf('orderId')}>
            <select {...createFormik.getFieldProps('orderId')} className={ccls('orderId')}>
              <option value="">Select order</option>
              {orders.map((o) => <option key={o.id} value={o.id}>#{o.id.slice(0, 8)}... — PKR {o.total.toLocaleString()} ({o.status})</option>)}
            </select>
          </FormField>
          <FormField label="Amount (PKR)" {...cf('amount')} hint="Amount is overridden by order total on the server">
            <input type="number" step="0.01" {...createFormik.getFieldProps('amount')} className={ccls('amount')} placeholder="0.00" />
          </FormField>
          <FormField label="Payment Method" {...cf('method')}>
            <select {...createFormik.getFieldProps('method')} className={ccls('method')}>
              {Object.values(PaymentMethod).map((m) => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
            </select>
          </FormField>
          <FormField label="Transaction ID (optional)" {...cf('transactionId')}>
            <input {...createFormik.getFieldProps('transactionId')} className={ccls('transactionId')} placeholder="e.g. TXN-123456" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createFormik.isSubmitting} className="btn-primary">{createFormik.isSubmitting ? 'Creating...' : 'Create Payment'}</button>
            <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
