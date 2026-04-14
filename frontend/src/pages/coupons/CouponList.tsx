import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../features/coupons/couponSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import FormField from '../../components/ui/FormField';
import { DiscountType } from '../../types';
import toast from 'react-hot-toast';

const couponSchema = Yup.object({
  code: Yup.string().required('Coupon code is required'),
  description: Yup.string(),
  discountType: Yup.string().oneOf(['PERCENTAGE', 'FLAT']).required('Discount type is required'),
  discountValue: Yup.number().min(0, 'Must be 0 or more').required('Discount value is required'),
  minOrderAmount: Yup.number().min(0).nullable(),
  startDate: Yup.string().required('Start date is required'),
  endDate: Yup.string().required('End date is required'),
  usageLimit: Yup.number().integer().min(1, 'Min 1').nullable(),
  perUserLimit: Yup.number().integer().min(1, 'Min 1').nullable(),
  isActive: Yup.boolean(),
});

const emptyValues = {
  code: '', description: '', discountType: 'PERCENTAGE' as string,
  discountValue: '' as unknown as number, minOrderAmount: '' as unknown as number,
  startDate: '', endDate: '', usageLimit: '' as unknown as number,
  perUserLimit: '' as unknown as number, isActive: true,
};

export default function CouponList() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.coupons);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchCoupons()); }, [dispatch]);

  const formik = useFormik({
    initialValues: emptyValues,
    validationSchema: couponSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const payload = {
        code: values.code,
        description: values.description || undefined,
        discountType: values.discountType as DiscountType,
        discountValue: Number(values.discountValue),
        minOrderAmount: values.minOrderAmount ? Number(values.minOrderAmount) : undefined,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        usageLimit: values.usageLimit ? Number(values.usageLimit) : undefined,
        perUserLimit: values.perUserLimit ? Number(values.perUserLimit) : undefined,
        isActive: values.isActive,
      };

      if (editId) {
        const r = await dispatch(updateCoupon({ id: editId, ...payload }));
        setSubmitting(false);
        if (updateCoupon.fulfilled.match(r)) { toast.success(`Coupon "${values.code}" updated`); setModalOpen(false); resetForm(); }
        else toast.error((r.payload as string) || 'Failed to update coupon');
      } else {
        const r = await dispatch(createCoupon(payload));
        setSubmitting(false);
        if (createCoupon.fulfilled.match(r)) { toast.success(`Coupon "${values.code}" created`); setModalOpen(false); resetForm(); }
        else toast.error((r.payload as string) || 'Failed to create coupon. Code may already exist.');
      }
    },
  });

  const openNew = () => { setEditId(null); formik.resetForm({ values: emptyValues }); setModalOpen(true); };
  const openEdit = (c: typeof items[0]) => {
    setEditId(c.id);
    formik.resetForm({
      values: {
        code: c.code, description: c.description || '', discountType: c.discountType,
        discountValue: c.discountValue, minOrderAmount: c.minOrderAmount ?? ('' as unknown as number),
        startDate: c.startDate.slice(0, 10), endDate: c.endDate.slice(0, 10),
        usageLimit: c.usageLimit ?? ('' as unknown as number), perUserLimit: c.perUserLimit ?? ('' as unknown as number),
        isActive: c.isActive,
      },
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const r = await dispatch(deleteCoupon(id));
    if (deleteCoupon.fulfilled.match(r)) toast.success(`Coupon "${code}" deleted`);
    else toast.error('Failed to delete coupon');
  };

  const f = (name: string) => ({ error: (formik.errors as Record<string, string>)[name], touched: (formik.touched as Record<string, boolean>)[name] });
  const cls = (name: string) => `input-field ${(formik.touched as Record<string, boolean>)[name] && (formik.errors as Record<string, string>)[name] ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`;

  if (loading && items.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Coupons</h1><p className="mt-1 text-sm text-gray-500">{items.length} coupons</p></div>
        <button onClick={openNew} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Coupon
        </button>
      </div>

      <div className="card">
        {items.length === 0 ? (
          <EmptyState title="No coupons" description="Create a coupon to offer discounts" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100"><th className="table-header">Code</th><th className="table-header">Discount</th><th className="table-header">Period</th><th className="table-header">Status</th><th className="table-header">Limits</th><th className="table-header text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50">
                    <td className="table-cell"><span className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-gray-900 bg-gray-100 rounded-lg px-2.5 py-1">{coupon.code}</span></td>
                    <td className="table-cell font-medium">{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `PKR ${coupon.discountValue}`}</td>
                    <td className="table-cell text-xs text-gray-500">{new Date(coupon.startDate).toLocaleDateString()} — {new Date(coupon.endDate).toLocaleDateString()}</td>
                    <td className="table-cell"><StatusBadge status={coupon.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                    <td className="table-cell text-xs text-gray-500">{coupon.usageLimit ? `${coupon.usageLimit} total` : 'Unlimited'}{coupon.perUserLimit ? ` / ${coupon.perUserLimit} per user` : ''}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(coupon)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                        </button>
                        <button onClick={() => handleDelete(coupon.id, coupon.code)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Coupon' : 'New Coupon'} wide>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Code" {...f('code')}>
              <input {...formik.getFieldProps('code')} className={`${cls('code')} font-mono uppercase`} placeholder="SUMMER20" />
            </FormField>
            <FormField label="Discount Type" {...f('discountType')}>
              <select {...formik.getFieldProps('discountType')} className={cls('discountType')}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat (PKR)</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Discount Value" {...f('discountValue')}>
              <input type="number" step="0.01" {...formik.getFieldProps('discountValue')} className={cls('discountValue')} placeholder="10" />
            </FormField>
            <FormField label="Min Order Amount" {...f('minOrderAmount')} hint="Optional">
              <input type="number" step="0.01" {...formik.getFieldProps('minOrderAmount')} className={cls('minOrderAmount')} placeholder="Optional" />
            </FormField>
          </div>
          <FormField label="Description" {...f('description')}>
            <input {...formik.getFieldProps('description')} className={cls('description')} placeholder="Optional description" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" {...f('startDate')}>
              <input type="date" {...formik.getFieldProps('startDate')} className={cls('startDate')} />
            </FormField>
            <FormField label="End Date" {...f('endDate')}>
              <input type="date" {...formik.getFieldProps('endDate')} className={cls('endDate')} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Usage Limit" {...f('usageLimit')} hint="Leave empty for unlimited">
              <input type="number" {...formik.getFieldProps('usageLimit')} className={cls('usageLimit')} placeholder="Unlimited" />
            </FormField>
            <FormField label="Per User Limit" {...f('perUserLimit')} hint="Leave empty for unlimited">
              <input type="number" {...formik.getFieldProps('perUserLimit')} className={cls('perUserLimit')} placeholder="Unlimited" />
            </FormField>
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" checked={formik.values.isActive} onChange={(e) => formik.setFieldValue('isActive', e.target.checked)} className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
            <span className="text-sm font-medium text-gray-700">Active</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={formik.isSubmitting} className="btn-primary">{formik.isSubmitting ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
