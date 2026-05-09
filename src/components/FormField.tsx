import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8,
  fontSize: 15, outline: 'none', boxSizing: 'border-box',
};

export function FormField({ label, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Button({
  children, variant = 'primary', ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'secondary' }) {
  const colors = {
    primary: { background: '#3b82f6', color: '#fff' },
    danger: { background: '#ef4444', color: '#fff' },
    secondary: { background: '#f3f4f6', color: '#374151' },
  };
  return (
    <button {...props} style={{
      padding: '10px 20px', border: 'none', borderRadius: 8, fontSize: 15,
      fontWeight: 600, cursor: 'pointer', ...colors[variant], ...props.style,
    }}>
      {children}
    </button>
  );
}
