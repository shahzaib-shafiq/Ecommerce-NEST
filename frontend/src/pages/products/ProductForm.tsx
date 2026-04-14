import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createProduct, updateProduct, fetchProduct, clearCurrent } from '../../features/products/productSlice';
import { fetchCategories } from '../../features/categories/categorySlice';
import { fetchStores } from '../../features/stores/storeSlice';
import FormField from '../../components/ui/FormField';
import toast from 'react-hot-toast';

const productSchema = Yup.object({
  name: Yup.string().required('Product name is required'),
  slug: Yup.string(),
  description: Yup.string(),
  price: Yup.number().min(0, 'Price must be 0 or more').required('Price is required'),
  stock: Yup.number().integer('Must be a whole number').min(0, 'Stock cannot be negative').required('Stock is required'),
  images: Yup.string(),
  storeId: Yup.string().uuid('Invalid store').required('Store is required'),
  categoryId: Yup.string(),
});

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current } = useAppSelector((s) => s.products);
  const { items: categories } = useAppSelector((s) => s.categories);
  const { items: stores } = useAppSelector((s) => s.stores);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchStores());
    if (id) dispatch(fetchProduct(id));
    return () => { dispatch(clearCurrent()); };
  }, [dispatch, id]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: current?.name || '',
      slug: current?.slug || '',
      description: current?.description || '',
      price: current?.price ?? '',
      stock: current?.stock ?? '',
      images: current?.images?.join(', ') || '',
      storeId: current?.storeId || '',
      categoryId: current?.categoryId || '',
    },
    validationSchema: productSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        name: values.name,
        slug: values.slug || values.name.toLowerCase().replace(/\s+/g, '-'),
        description: values.description || undefined,
        price: Number(values.price),
        stock: Number(values.stock),
        images: values.images ? values.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
        storeId: values.storeId,
        categoryId: values.categoryId || undefined,
        createdById: current?.createdById || user?.id || '',
      };

      if (isEdit && id) {
        const result = await dispatch(updateProduct({ id, ...payload }));
        setSubmitting(false);
        if (updateProduct.fulfilled.match(result)) {
          toast.success(`"${payload.name}" updated successfully`);
          navigate('/products');
        } else {
          toast.error((result.payload as string) || 'Failed to update product. Please try again.');
        }
      } else {
        const result = await dispatch(createProduct(payload));
        setSubmitting(false);
        if (createProduct.fulfilled.match(result)) {
          toast.success(`"${payload.name}" created successfully`);
          navigate('/products');
        } else {
          toast.error((result.payload as string) || 'Failed to create product. Please check all fields.');
        }
      }
    },
  });

  const f = (name: string) => ({
    error: (formik.errors as Record<string, string>)[name],
    touched: (formik.touched as Record<string, boolean>)[name],
  });
  const cls = (name: string) =>
    `input-field ${(formik.touched as Record<string, boolean>)[name] && (formik.errors as Record<string, string>)[name] ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
        <p className="mt-1 text-sm text-gray-500">{isEdit ? 'Update product details' : 'Add a new product to your store'}</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Name" {...f('name')}>
            <input {...formik.getFieldProps('name')} className={cls('name')} placeholder="Product name" />
          </FormField>
          <FormField label="Slug" {...f('slug')} hint="Auto-generated from name if empty">
            <input {...formik.getFieldProps('slug')} className={cls('slug')} placeholder="auto-generated" />
          </FormField>
        </div>

        <FormField label="Description" {...f('description')}>
          <textarea {...formik.getFieldProps('description')} rows={3} className={cls('description')} placeholder="Product description..." />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Price (PKR)" {...f('price')}>
            <input type="number" step="0.01" {...formik.getFieldProps('price')} className={cls('price')} placeholder="0.00" />
          </FormField>
          <FormField label="Stock" {...f('stock')}>
            <input type="number" {...formik.getFieldProps('stock')} className={cls('stock')} placeholder="0" />
          </FormField>
        </div>

        <FormField label="Image URLs" {...f('images')} hint="Enter multiple URLs separated by commas">
          <input {...formik.getFieldProps('images')} className={cls('images')} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Store" {...f('storeId')}>
            <select {...formik.getFieldProps('storeId')} className={cls('storeId')}>
              <option value="">Select store</option>
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Category" {...f('categoryId')}>
            <select {...formik.getFieldProps('categoryId')} className={cls('categoryId')}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={formik.isSubmitting} className="btn-primary">
            {formik.isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
