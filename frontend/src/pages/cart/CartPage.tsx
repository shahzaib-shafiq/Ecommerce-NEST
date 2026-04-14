import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCart, removeCartItem, updateCartItem, clearCart } from '../../features/cart/cartSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((s) => s.cart);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (user?.id) dispatch(fetchCart(user.id));
  }, [dispatch, user?.id]);

  const handleQuantity = async (itemId: string, quantity: number) => {
    if (!user?.id || quantity < 1) return;
    await dispatch(updateCartItem({ itemId, quantity, userId: user.id }));
  };

  const handleRemove = async (itemId: string) => {
    if (!user?.id) return;
    const r = await dispatch(removeCartItem({ itemId, userId: user.id }));
    if (removeCartItem.fulfilled.match(r)) toast.success('Item removed');
  };

  const handleClear = async () => {
    if (!cart?.id || !confirm('Clear all items?')) return;
    const r = await dispatch(clearCart(cart.id));
    if (clearCart.fulfilled.match(r)) toast.success('Cart cleared');
  };

  if (loading) return <LoadingSpinner />;

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} items</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClear} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState title="Your cart is empty" description="Add products to your cart to see them here" />
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                {item.product?.images?.[0] ? (
                  <img src={item.product.images[0]} alt="" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75Z" /></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.product?.name || 'Unknown Product'}</p>
                <p className="text-sm text-gray-500">PKR {item.product?.price?.toLocaleString() || 0} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                </button>
                <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                <button onClick={() => handleQuantity(item.id, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
              </div>
              <p className="font-semibold text-gray-900 w-28 text-right">PKR {((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
              <button onClick={() => handleRemove(item.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}

          <div className="card flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">PKR {total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
