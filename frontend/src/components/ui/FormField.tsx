import { useId } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
  hint?: string;
  htmlFor?: string;
}

export default function FormField({ label, error, touched, children, hint, htmlFor }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor ?? generatedId;
  const showError = touched && error;

  return (
    <div>
      <label htmlFor={fieldId} className="label">{label}</label>
      {children}
      {showError && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
      {!showError && hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
