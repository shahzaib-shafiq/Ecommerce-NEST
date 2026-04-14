import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchStores, createStore, updateStore, deleteStore } from '../../features/stores/storeSlice';
import { fetchUsers } from '../../features/users/userSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import toast from 'react-hot-toast';

const storeSchema = Yup.object({
  name: Yup.string().required('Store name is required'),
  slug: Yup.string(),
  ownerId: Yup.string().uuid('Invalid owner').required('Owner is required'),
  logo: Yup.string().url('Must be a valid URL').optional().nullable(),
  summary: Yup.string(),
});

export default function StoreList() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.stores);
  const { items: users } = useAppSelector((s) => s.users);
  const owners = users.filter((u) => u.role === 'STORE_OWNER');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchStores()); dispatch(fetchUsers()); }, [dispatch]);

  const formik = useFormik({
    initialValues: { name: '', slug: '', ownerId: '', logo: '', summary: '' },
    validationSchema: storeSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const payload = { ...values, slug: values.slug || values.name.toLowerCase().replace(/\s+/g, '-'), logo: values.logo || undefined, summary: values.summary || undefined };
      if (editId) {
        const r = await dispatch(updateStore({ id: editId, ...payload }));
        setSubmitting(false);
        if (updateStore.fulfilled.match(r)) { toast.success(`Store "${values.name}" updated`); setModalOpen(false); resetForm(); }
        else toast.error((r.payload as string) || 'Failed to update store');
      } else {
        const r = await dispatch(createStore(payload));
        setSubmitting(false);
        if (createStore.fulfilled.match(r)) { toast.success(`Store "${values.name}" created`); setModalOpen(false); resetForm(); }
        else toast.error((r.payload as string) || 'Failed to create store. Owner must have STORE_OWNER role.');
      }
    },
  });

  const openNew = () => { setEditId(null); formik.resetForm({ values: { name: '', slug: '', ownerId: '', logo: '', summary: '' } }); setModalOpen(true); };
  const openEdit = (store: typeof items[0]) => {
    setEditId(store.id);
    formik.resetForm({ values: { name: store.name, slug: store.slug, ownerId: store.ownerId, logo: store.logo || '', summary: store.summary || '' } });
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete store "${name}"?`)) return;
    const r = await dispatch(deleteStore(id));
    if (deleteStore.fulfilled.match(r)) toast.success(`Store "${name}" deleted`);
    else toast.error('Failed to delete store');
  };

  const f = (name: string) => ({ error: (formik.errors as Record<string, string>)[name], touched: (formik.touched as Record<string, boolean>)[name] });
  const cls = (name: string) => `input-field ${(formik.touched as Record<string, boolean>)[name] && (formik.errors as Record<string, string>)[name] ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`;

  if (loading && items.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} stores</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Store
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <div className="col-span-full card"><EmptyState title="No stores" description="Create your first store" /></div>
        ) : (
          items.map((store) => (
            <div key={store.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-lg">{store.name[0]}</div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(store)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                  </button>
                  <button onClick={() => handleDelete(store.id, store.name)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">{store.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{store.slug}</p>
              {store.summary && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{store.summary}</p>}
              <p className="text-xs text-gray-400 mt-3">Owner: {store.owner ? `${store.owner.firstName} ${store.owner.lastName}` : store.ownerId.slice(0, 8)}</p>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Store' : 'New Store'}>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <FormField label="Store Name" {...f('name')}>
            <input {...formik.getFieldProps('name')} className={cls('name')} placeholder="My Store" />
          </FormField>
          <FormField label="Slug" {...f('slug')} hint="Auto-generated from name if empty">
            <input {...formik.getFieldProps('slug')} className={cls('slug')} placeholder="my-store" />
          </FormField>
          <FormField label="Owner" {...f('ownerId')}>
            <select {...formik.getFieldProps('ownerId')} className={cls('ownerId')}>
              <option value="">Select owner</option>
              {owners.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>)}
            </select>
          </FormField>
          <FormField label="Logo URL" {...f('logo')}>
            <input {...formik.getFieldProps('logo')} className={cls('logo')} placeholder="https://example.com/logo.png" />
          </FormField>
          <FormField label="Summary" {...f('summary')}>
            <textarea {...formik.getFieldProps('summary')} rows={2} className={cls('summary')} placeholder="Short description..." />
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
