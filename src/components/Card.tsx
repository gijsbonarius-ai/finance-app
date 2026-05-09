import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export default function Card({ title, children, style }: CardProps) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      padding: 24, ...style,
    }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#374151', fontWeight: 600 }}>{title}</h3>}
      {children}
    </div>
  );
}
