import { useMemo } from 'react';
import { storage } from '../storage';
import { formatCurrency, currentMonth, monthFromDate, last12Months, formatMonth } from '../utils';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { ArrowDownCircle, ArrowUpCircle, Wallet, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Dashboard() {
  const transactions = storage.getTransactions();
  const assets = storage.getAssets();
  const liabilities = storage.getLiabilities();
  const thisMonth = currentMonth();

  const thisMonthTx = transactions.filter(t => monthFromDate(t.date) === thisMonth);
  const income = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;

  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const months = last12Months();
  const monthlyData = useMemo(() => months.map(m => {
    const mtx = transactions.filter(t => monthFromDate(t.date) === m);
    return {
      month: formatMonth(m).split(' ')[0].slice(0, 3),
      income: mtx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: mtx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  }), [transactions]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const recentTx = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 26, fontWeight: 700, color: '#111827' }}>
        Overview — {formatMonth(thisMonth)}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Income this month" value={formatCurrency(income)} color="#10b981" icon={<ArrowDownCircle size={22} />} />
        <StatCard label="Expenses this month" value={formatCurrency(expenses)} color="#ef4444" icon={<ArrowUpCircle size={22} />} />
        <StatCard label="Monthly balance" value={formatCurrency(balance)} color={balance >= 0 ? '#3b82f6' : '#f59e0b'} icon={<Wallet size={22} />} />
        <StatCard label="Net worth" value={formatCurrency(netWorth)} color="#8b5cf6" icon={<TrendingUp size={22} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card title="Income vs Expenses — last 12 months">
          {transactions.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>
              No transactions yet. Add some in the Transactions tab.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `€${v}`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Expenses by category — this month">
          {expenseByCategory.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No expenses this month.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                  {expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card title="Recent transactions">
        {recentTx.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No transactions yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '8px 0' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 0', color: '#6b7280' }}>{tx.date}</td>
                  <td style={{ padding: '10px 0' }}>{tx.description}</td>
                  <td style={{ padding: '10px 0', color: '#6b7280' }}>{tx.category}</td>
                  <td style={{
                    padding: '10px 0', textAlign: 'right', fontWeight: 600,
                    color: tx.type === 'income' ? '#10b981' : '#ef4444',
                  }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
