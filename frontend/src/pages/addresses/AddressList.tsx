import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '../../features/addresses/addressSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import toast from 'react-hot-toast';

const addressSchema = Yup.object({
  line1: Yup.string().required('Address line 1 is required'),
  line2: Yup.string(),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  country: Yup.string().required('Country is required'),
  postal: Yup.string().required('Postal code is required'),
  phone: Yup.string(),
});

const emptyValues = { line1: '', line2: '', city: '', state: '', country: '', postal: '', phone: '' };

export default function AddressList() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.addresses);
  const user = useAppSelector((s) => s.auth.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { if (user?.id) dispatch(fetchAddresses(user.id)); }, [dispatch, user?.id]);

  const formik = useFormik({
    initialValues: emptyValues,
    validationSchema: addressSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const payload = { ...values, userId: user?.id || '' };
      if (editId) {
        const r = await dispatch(updateAddress({ id: editId, ...payload }));
        setSubmitting(false);
        if (updateAddress.fulfilled.match(r)) { toast.success('Address updated successfully'); setModalOpen(false); resetForm(); }
        else toast.error((r.payload as string) || 'Failed to update address');
      } else {
        const r = await dispatch(createAddress(payload));
        setSubmitting(false);
        if (createAddress.fulfilled.match(r)) { toast.success('Address added successfully'); setModalOpen(false); resetForm(); }
        else toast.error((r.payload as string) || 'Failed to create address');
      }
    },
  });

  const openNew = () => { setEditId(null); formik.resetForm({ values: emptyValues }); setModalOpen(true); };
  const openEdit = (a: typeof items[0]) => {
    setEditId(a.id);
    formik.resetForm({ values: { line1: a.line1, line2: a.line2 || '', city: a.city, state: a.state, country: a.country, postal: a.postal, phone: a.phone || '' } });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    const r = await dispatch(deleteAddress(id));
    if (deleteAddress.fulfilled.match(r)) toast.success('Address deleted');
    else toast.error('Failed to delete address');
  };

  const f = (n: string) => ({ error: (formik.errors as Record<string, string>)[n], touched: (formik.touched as Record<string, boolean>)[n] });
  const cls = (n: string) => `input-field ${(formik.touched as Record<string, boolean>)[n] && (formik.errors as Record<string, string>)[n] ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`;

  if (loading && items.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Addresses</h1><p className="mt-1 text-sm text-gray-500">{items.length} saved addresses</p></div>
        <button onClick={openNew} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Address
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <div className="col-span-full card"><EmptyState title="No addresses" description="Add your first delivery address" /></div>
        ) : (
          items.map((addr) => (
            <div key={addr.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(addr)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">{addr.line1}</p>
              {addr.line2 && <p className="text-sm text-gray-600">{addr.line2}</p>}
              <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postal}</p>
              <p className="text-sm text-gray-500">{addr.country}</p>
              {addr.phone && <p className="text-xs text-gray-400 mt-2">{addr.phone}</p>}
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Address' : 'New Address'} wide>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <FormField label="Address Line 1" {...f('line1')}>
            <input {...formik.getFieldProps('line1')} className={cls('line1')} placeholder="Street address" />
          </FormField>
          <FormField label="Address Line 2 (optional)" {...f('line2')}>
            <input {...formik.getFieldProps('line2')} className={cls('line2')} placeholder="Apt, suite, etc." />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="City" {...f('city')}>
              <input {...formik.getFieldProps('city')} className={cls('city')} />
            </FormField>
            <FormField label="State" {...f('state')}>
              <input {...formik.getFieldProps('state')} className={cls('state')} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Country" {...f('country')}>
              <input {...formik.getFieldProps('country')} className={cls('country')} />
            </FormField>
            <FormField label="Postal Code" {...f('postal')}>
              <input {...formik.getFieldProps('postal')} className={cls('postal')} />
            </FormField>
          </div>
          <FormField label="Phone (optional)" {...f('phone')}>
            <input {...formik.getFieldProps('phone')} className={cls('phone')} placeholder="Optional" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={formik.isSubmitting} className="btn-primary">{formik.isSubmitting ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
