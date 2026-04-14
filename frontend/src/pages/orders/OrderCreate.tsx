import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createOrder } from '../../features/orders/orderSlice';
import { fetchProducts } from '../../features/products/productSlice';
import { fetchStores } from '../../features/stores/storeSlice';
import FormField from '../../components/ui/FormField';
import toast from 'react-hot-toast';

const orderSchema = Yup.object({
  storeId: Yup.string().uuid('Invalid store').required('Store is required'),
  couponCode: Yup.string().default(''),
  items: Yup.array()
    .of(
      Yup.object({
        productId: Yup.string().uuid('Select a product').required('Product is required'),
        quantity: Yup.number().integer().min(1, 'Min qty is 1').required('Quantity is required'),
      }),
    )
    .min(1, 'Add at least one item'),
});

export default function OrderCreate() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { items: products } = useAppSelector((s) => s.products);
  const { items: stores } = useAppSelector((s) => s.stores);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchStores());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      storeId: '',
      couponCode: '',
      items: [{ productId: '', quantity: 1 }],
    },
    validationSchema: orderSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const validItems = values.items.filter((l) => l.productId && l.quantity > 0);
      if (validItems.length === 0) { toast.error('Add at least one valid item'); setSubmitting(false); return; }

      const payload = {
        userId: user?.id || '',
        storeId: values.storeId,
        items: validItems,
        couponCode: values.couponCode || '',
      };
      const r = await dispatch(createOrder(payload));
      setSubmitting(false);
      if (createOrder.fulfilled.match(r)) {
        toast.success('Order placed successfully!');
        navigate('/orders');
      } else {
        toast.error((r.payload as string) || 'Failed to create order. Check items and coupon code.');
      }
    },
  });

  const storeProducts = formik.values.storeId ? products.filter((p) => p.storeId === formik.values.storeId) : products;

  const subtotal = formik.values.items.reduce((sum, line) => {
    const product = products.find((p) => p.id === line.productId);
    return sum + (product?.price || 0) * line.quantity;
  }, 0);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
        <p className="mt-1 text-sm text-gray-500">Place a new order with product items</p>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Store</h3>
            <FormField label="Select Store" error={formik.errors.storeId} touched={formik.touched.storeId}>
              <select {...formik.getFieldProps('storeId')} className={`input-field ${formik.touched.storeId && formik.errors.storeId ? 'border-red-400' : ''}`}>
                <option value="">Select store</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FormField>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Items</h3>
              <button type="button" onClick={() => formik.setFieldValue('items', [...formik.values.items, { productId: '', quantity: 1 }])} className="btn-secondary text-xs px-3 py-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add Item
              </button>
            </div>
            {typeof formik.errors.items === 'string' && formik.touched.items && (
              <p className="text-xs text-red-600 mb-3">{formik.errors.items}</p>
            )}
            <FieldArray name="items">
              {({ remove }) => (
                <div className="space-y-3">
                  {formik.values.items.map((line, idx) => {
                    const selectedProduct = products.find((p) => p.id === line.productId);
                    const itemErrors = formik.errors.items?.[idx] as Record<string, string> | undefined;
                    const itemTouched = formik.touched.items?.[idx] as Record<string, boolean> | undefined;
                    return (
                      <div key={idx} className="flex items-end gap-3">
                        <div className="flex-1">
                          {idx === 0 && <label className="label">Product</label>}
                          <select
                            {...formik.getFieldProps(`items.${idx}.productId`)}
                            className={`input-field ${itemTouched?.productId && itemErrors?.productId ? 'border-red-400' : ''}`}
                          >
                            <option value="">Select product</option>
                            {storeProducts.map((p) => (
                              <option key={p.id} value={p.id}>{p.name} — PKR {p.price.toLocaleString()} (stock: {p.stock})</option>
                            ))}
                          </select>
                          {itemTouched?.productId && itemErrors?.productId && <p className="text-xs text-red-600 mt-0.5">{itemErrors.productId}</p>}
                        </div>
                        <div className="w-24">
                          {idx === 0 && <label className="label">Qty</label>}
                          <input
                            type="number"
                            min={1}
                            {...formik.getFieldProps(`items.${idx}.quantity`)}
                            className={`input-field ${itemTouched?.quantity && itemErrors?.quantity ? 'border-red-400' : ''}`}
                          />
                        </div>
                        <div className="w-28 text-right">
                          {idx === 0 && <label className="label">Subtotal</label>}
                          <p className="py-2.5 text-sm font-medium text-gray-700">PKR {((selectedProduct?.price || 0) * line.quantity).toLocaleString()}</p>
                        </div>
                        <div className="pb-1">
                          <button type="button" onClick={() => formik.values.items.length > 1 && remove(idx)} disabled={formik.values.items.length <= 1}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </FieldArray>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Coupon Code</h3>
            <FormField label="Code" error={formik.errors.couponCode} touched={formik.touched.couponCode} hint="Enter a valid coupon code or leave empty">
              <input {...formik.getFieldProps('couponCode')} onChange={(e) => formik.setFieldValue('couponCode', e.target.value.toUpperCase())} className="input-field font-mono max-w-sm" placeholder="e.g. WELCOME10" />
            </FormField>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Estimated Total</span>
              <span className="text-2xl font-bold text-gray-900">PKR {subtotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Final total may differ after coupon discount is applied on server</p>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={formik.isSubmitting} className="btn-primary">
              {formik.isSubmitting ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              )}
              {formik.isSubmitting ? 'Placing order...' : 'Place Order'}
            </button>
            <button type="button" onClick={() => navigate('/orders')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
}
