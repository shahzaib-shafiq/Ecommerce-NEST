import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchOrder, updateOrderStatus, clearCurrent } from '../../features/orders/orderSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { OrderStatus } from '../../types';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { current: order, loading } = useAppSelector((s) => s.orders);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchOrder(id));
    return () => { dispatch(clearCurrent()); };
  }, [dispatch, id]);

  const handleStatusUpdate = async () => {
    if (!id || !newStatus) return;
    const r = await dispatch(updateOrderStatus({ id, status: newStatus }));
    if (updateOrderStatus.fulfilled.match(r)) { toast.success('Status updated'); setNewStatus(''); }
    else toast.error('Failed to update status');
  };

  if (loading || !order) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/orders" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Items</h3>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{item.product?.name || item.productId.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">PKR {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">PKR {order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Status</h3>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field mb-3">
              <option value="">Select status</option>
              {Object.values(OrderStatus).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleStatusUpdate} disabled={!newStatus} className="btn-primary w-full">
              Update Status
            </button>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">History</h3>
              <div className="space-y-3">
                {order.statusHistory.map((h) => (
                  <div key={h.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                    <div>
                      <StatusBadge status={h.status} />
                      <p className="text-xs text-gray-500 mt-1">{new Date(h.createdAt).toLocaleString()}</p>
                      {h.note && <p className="text-xs text-gray-600 mt-0.5">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping */}
          {order.shipping && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-xs text-gray-500">Provider</dt><dd className="text-gray-700">{order.shipping.provider}</dd></div>
                <div><dt className="text-xs text-gray-500">Status</dt><dd><StatusBadge status={order.shipping.status} /></dd></div>
                {order.shipping.trackingNumber && (
                  <div><dt className="text-xs text-gray-500">Tracking</dt><dd className="text-gray-700 font-mono text-xs">{order.shipping.trackingNumber}</dd></div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
