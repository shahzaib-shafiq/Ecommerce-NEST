import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../features/categories/categorySlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import toast from 'react-hot-toast';

const categorySchema = Yup.object({
  name: Yup.string().min(2, 'Min 2 characters').required('Category name is required'),
});

export default function CategoryList() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.categories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema: categorySchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (editId) {
        const r = await dispatch(updateCategory({ id: editId, name: values.name }));
        setSubmitting(false);
        if (updateCategory.fulfilled.match(r)) {
          toast.success(`Category "${values.name}" updated`);
          setModalOpen(false);
          resetForm();
        } else {
          toast.error((r.payload as string) || 'Failed to update category. Name may already exist.');
        }
      } else {
        const r = await dispatch(createCategory(values.name));
        setSubmitting(false);
        if (createCategory.fulfilled.match(r)) {
          toast.success(`Category "${values.name}" created`);
          setModalOpen(false);
          resetForm();
        } else {
          toast.error((r.payload as string) || 'Failed to create category. Name may already exist.');
        }
      }
    },
  });

  const openNew = () => { setEditId(null); formik.resetForm({ values: { name: '' } }); setModalOpen(true); };
  const openEdit = (id: string, currentName: string) => { setEditId(id); formik.resetForm({ values: { name: currentName } }); setModalOpen(true); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const r = await dispatch(deleteCategory(id));
    if (deleteCategory.fulfilled.match(r)) toast.success(`Category "${name}" deleted`);
    else toast.error('Failed to delete category');
  };

  if (loading && items.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} categories</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Category
        </button>
      </div>

      <div className="card">
        {items.length === 0 ? (
          <EmptyState title="No categories" description="Create your first category" action={<button onClick={openNew} className="btn-primary">Add Category</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Name</th>
                  <th className="table-header">ID</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="table-cell font-medium text-gray-900">{cat.name}</td>
                    <td className="table-cell text-gray-500 font-mono text-xs">{cat.id.slice(0, 8)}...</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(cat.id, cat.name)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Category' : 'New Category'}>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <FormField label="Category Name" error={formik.errors.name} touched={formik.touched.name}>
            <input {...formik.getFieldProps('name')} className={`input-field ${formik.touched.name && formik.errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="e.g. Electronics" />
          </FormField>
          <div className="flex gap-3">
            <button type="submit" disabled={formik.isSubmitting} className="btn-primary">{formik.isSubmitting ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
