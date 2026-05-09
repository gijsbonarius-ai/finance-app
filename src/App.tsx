import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import NetWorth from './pages/NetWorth';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, TrendingUp } from 'lucide-react';

type Page = 'dashboard' | 'transactions' | 'budget' | 'networth';

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={20} /> },
  { id: 'budget', label: 'Budget', icon: <PiggyBank size={20} /> },
  { id: 'networth', label: 'Net Worth', icon: <TrendingUp size={20} /> },
];

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f9', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{
        width: 220, background: '#1e293b', color: '#fff',
        display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 28px', fontSize: 18, fontWeight: 700, color: '#60a5fa' }}>
          Family Finances
        </div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 20px', border: 'none', background: 'none',
              color: page === item.id ? '#60a5fa' : '#94a3b8',
              fontWeight: page === item.id ? 600 : 400,
              fontSize: 15, cursor: 'pointer', textAlign: 'left',
              borderLeft: page === item.id ? '3px solid #60a5fa' : '3px solid transparent',
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'transactions' && <Transactions />}
        {page === 'budget' && <Budget />}
        {page === 'networth' && <NetWorth />}
      </main>
    </div>
  );
}
