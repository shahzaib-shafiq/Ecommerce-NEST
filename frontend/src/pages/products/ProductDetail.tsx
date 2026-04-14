import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProduct, clearCurrent } from '../../features/products/productSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { current: product, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    if (id) dispatch(fetchProduct(id));
    return () => { dispatch(clearCurrent()); };
  }, [dispatch, id]);

  if (loading || !product) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/products" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500">{product.slug}</p>
        </div>
        <Link to={`/products/${product.id}/edit`} className="btn-primary">Edit Product</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Details</h3>
          <dl className="space-y-4">
            <div><dt className="text-xs text-gray-500">Price</dt><dd className="text-lg font-bold text-gray-900">PKR {product.price.toLocaleString()}</dd></div>
            <div><dt className="text-xs text-gray-500">Stock</dt><dd className="text-lg font-bold text-gray-900">{product.stock}</dd></div>
            <div><dt className="text-xs text-gray-500">Category</dt><dd className="text-sm text-gray-700">{product.category?.name || 'None'}</dd></div>
            <div><dt className="text-xs text-gray-500">Store</dt><dd className="text-sm text-gray-700">{product.store?.name || '—'}</dd></div>
            <div><dt className="text-xs text-gray-500">Created By</dt><dd className="text-sm text-gray-700">{product.createdBy ? `${product.createdBy.firstName} ${product.createdBy.lastName}` : '—'}</dd></div>
          </dl>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Description</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{product.description || 'No description provided.'}</p>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-4">Dates</h3>
          <dl className="space-y-2">
            <div><dt className="text-xs text-gray-500">Created</dt><dd className="text-sm text-gray-700">{new Date(product.createdAt).toLocaleString()}</dd></div>
            <div><dt className="text-xs text-gray-500">Updated</dt><dd className="text-sm text-gray-700">{new Date(product.updatedAt).toLocaleString()}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
