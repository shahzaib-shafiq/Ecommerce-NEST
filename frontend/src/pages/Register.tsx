import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { register, clearError } from '../features/auth/authSlice';
import { Role } from '../types';
import FormField from '../components/ui/FormField';
import toast from 'react-hot-toast';

const registerSchema = Yup.object({
  firstName: Yup.string().max(50, 'Max 50 characters').required('First name is required'),
  lastName: Yup.string().max(50, 'Max 50 characters').required('Last name is required'),
  email: Yup.string().email('Invalid email address').max(50, 'Max 50 characters').required('Email is required'),
  role: Yup.string().oneOf(Object.values(Role), 'Invalid role').required('Role is required'),
  phone: Yup.string().max(12, 'Max 12 characters').optional(),
  password: Yup.string().min(6, 'Min 6 characters').max(255, 'Max 255 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.auth);

  const formik = useFormik({
    initialValues: {
      firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
      role: Role.CUSTOMER as string, phone: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      dispatch(clearError());
      const { confirmPassword, ...userData } = values;
      void confirmPassword;
      const result = await dispatch(register(userData));
      setSubmitting(false);
      if (register.fulfilled.match(result)) {
        toast.success('Account created successfully! Please sign in.');
        navigate('/login');
      } else {
        const msg = result.payload;
        toast.error(typeof msg === 'string' ? msg : Array.isArray(msg) ? (msg as string[]).join(', ') : 'Registration failed. Please check your inputs.');
      }
    },
  });

  const f = (name: string) => ({
    error: (formik.errors as Record<string, string>)[name],
    touched: (formik.touched as Record<string, boolean>)[name],
  });
  const inputCls = (name: string) =>
    `input-field ${(formik.touched as Record<string, boolean>)[name] && (formik.errors as Record<string, string>)[name] ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`;

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Join ECS</h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Create your account and start managing your ecommerce business today.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-500">Fill in the details below to get started</p>

          <form onSubmit={formik.handleSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First name" {...f('firstName')}>
                <input {...formik.getFieldProps('firstName')} className={inputCls('firstName')} placeholder="John" />
              </FormField>
              <FormField label="Last name" {...f('lastName')}>
                <input {...formik.getFieldProps('lastName')} className={inputCls('lastName')} placeholder="Doe" />
              </FormField>
            </div>

            <FormField label="Email address" {...f('email')}>
              <input type="email" {...formik.getFieldProps('email')} className={inputCls('email')} placeholder="you@example.com" />
            </FormField>

            <FormField label="Role" {...f('role')}>
              <select {...formik.getFieldProps('role')} className={inputCls('role')}>
                <option value={Role.CUSTOMER}>Customer</option>
                <option value={Role.STORE_OWNER}>Store Owner</option>
                <option value={Role.STORE_MANAGER}>Store Manager</option>
                <option value={Role.DELIVERY_AGENT}>Delivery Agent</option>
                <option value={Role.SUPPORT_AGENT}>Support Agent</option>
                <option value={Role.ADMIN}>Admin</option>
                <option value={Role.USER}>User</option>
              </select>
            </FormField>

            <FormField label="Phone (optional)" {...f('phone')} hint="Max 12 characters">
              <input type="tel" maxLength={12} {...formik.getFieldProps('phone')} className={inputCls('phone')} placeholder="+923001234567" />
            </FormField>

            <FormField label="Password" {...f('password')}>
              <input type="password" {...formik.getFieldProps('password')} className={inputCls('password')} placeholder="Min. 6 characters" />
            </FormField>

            <FormField label="Confirm password" {...f('confirmPassword')}>
              <input type="password" {...formik.getFieldProps('confirmPassword')} className={inputCls('confirmPassword')} placeholder="Confirm your password" />
            </FormField>

            <button type="submit" disabled={loading || formik.isSubmitting} className="btn-primary w-full">
              {(loading || formik.isSubmitting) ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : null}
              {(loading || formik.isSubmitting) ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
