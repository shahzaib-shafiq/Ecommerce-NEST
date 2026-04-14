import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchOrders, deleteOrder } from '../../features/orders/orderSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function OrderList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((s) => s.orders);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  const filtered = statusFilter === 'ALL' ? items : items.filter((o) => o.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    const r = await dispatch(deleteOrder(id));
    if (deleteOrder.fulfilled.match(r)) toast.success('Order deleted');
  };

  if (loading && items.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} total orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders/new')} className="btn-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            New Order
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {sorted.length === 0 ? (
          <EmptyState title="No orders found" description={statusFilter !== 'ALL' ? 'Try a different filter' : 'No orders yet'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Order ID</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Items</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Date</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="table-cell">
                      <Link to={`/orders/${order.id}`} className="font-medium text-indigo-600 hover:text-indigo-500 font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="table-cell"><StatusBadge status={order.status} /></td>
                    <td className="table-cell">{order.items?.length || 0} items</td>
                    <td className="table-cell font-semibold">PKR {order.total.toLocaleString()}</td>
                    <td className="table-cell text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/orders/${order.id}`} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </Link>
                        <button onClick={() => handleDelete(order.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
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
    </div>
  );
}
