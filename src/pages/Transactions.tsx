import { useState } from 'react';
import { storage } from '../storage';
import type { Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';
import { formatCurrency, generateId, currentMonth } from '../utils';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { FormField, Input, Select, Button } from '../components/FormField';
import { Trash2, PlusCircle } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

function emptyForm(): Omit<Transaction, 'id'> {
  return {
    date: today(),
    type: 'expense',
    category: EXPENSE_CATEGORIES[0],
    description: '',
    amount: 0,
    person: 'joint',
  };
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [filterMonth, setFilterMonth] = useState(currentMonth());
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  function save(updated: Transaction[]) {
    setTransactions(updated);
    storage.saveTransactions(updated);
  }

  function add() {
    if (!form.description || form.amount <= 0) return;
    const updated = [...transactions, { ...form, id: generateId() }];
    save(updated);
    setShowModal(false);
    setForm(emptyForm());
  }

  function remove(id: string) {
    save(transactions.filter(t => t.id !== id));
  }

  function handleTypeChange(type: 'income' | 'expense') {
    setForm(f => ({
      ...f, type,
      category: type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  }

  const filtered = transactions
    .filter(t => t.date.startsWith(filterMonth))
    .filter(t => filterType === 'all' || t.type === filterType)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const months = Array.from({ length: 13 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#111827' }}>Transactions</h1>
        <Button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlusCircle size={18} /> Add Transaction
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <Select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 180 }}>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </Select>
        <Select value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)} style={{ width: 140 }}>
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </Select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center', fontSize: 14 }}>
          <span style={{ color: '#10b981', fontWeight: 600 }}>+{formatCurrency(totalIncome)}</span>
          <span style={{ color: '#ef4444', fontWeight: 600 }}>-{formatCurrency(totalExpenses)}</span>
          <span style={{ color: '#3b82f6', fontWeight: 700 }}>= {formatCurrency(totalIncome - totalExpenses)}</span>
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '48px 0' }}>
            No transactions found. Click "Add Transaction" to get started.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Person</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Amount</th>
                <th style={{ padding: '8px 12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 12px', color: '#6b7280' }}>{tx.date}</td>
                  <td style={{ padding: '12px 12px' }}>{tx.description}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{
                      background: '#f3f4f6', padding: '2px 10px', borderRadius: 20, fontSize: 12,
                    }}>{tx.category}</span>
                  </td>
                  <td style={{ padding: '12px 12px', color: '#6b7280', textTransform: 'capitalize' }}>{tx.person}</td>
                  <td style={{
                    padding: '12px 12px', textAlign: 'right', fontWeight: 600,
                    color: tx.type === 'income' ? '#10b981' : '#ef4444',
                  }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <button onClick={() => remove(tx.id)} style={{
                      border: 'none', background: 'none', cursor: 'pointer', color: '#d1d5db',
                      padding: 4,
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <Modal title="Add Transaction" onClose={() => { setShowModal(false); setForm(emptyForm()); }}>
          <FormField label="Type">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['expense', 'income'] as const).map(t => (
                <button key={t} onClick={() => handleTypeChange(t)} style={{
                  flex: 1, padding: '10px 0', border: '2px solid',
                  borderColor: form.type === t ? (t === 'income' ? '#10b981' : '#ef4444') : '#e5e7eb',
                  borderRadius: 8, background: form.type === t ? (t === 'income' ? '#f0fdf4' : '#fef2f2') : '#fff',
                  cursor: 'pointer', fontWeight: 600, fontSize: 14,
                  color: form.type === t ? (t === 'income' ? '#10b981' : '#ef4444') : '#6b7280',
                  textTransform: 'capitalize',
                }}>
                  {t}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Date">
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </FormField>
          <FormField label="Description">
            <Input
              type="text" placeholder="e.g. Grocery shopping"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </FormField>
          <FormField label="Category">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Amount (€)">
            <Input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
            />
          </FormField>
          <FormField label="Who">
            <Select value={form.person} onChange={e => setForm(f => ({ ...f, person: e.target.value as Transaction['person'] }))}>
              <option value="joint">Joint</option>
              <option value="me">Me</option>
              <option value="partner">Partner</option>
            </Select>
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); setForm(emptyForm()); }}>Cancel</Button>
            <Button onClick={add}>Add</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
