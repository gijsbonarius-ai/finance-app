import { useState } from 'react';
import { storage } from '../storage';
import type { BudgetEntry } from '../types';
import { EXPENSE_CATEGORIES } from '../types';
import { formatCurrency, currentMonth, monthFromDate, generateId, formatMonth } from '../utils';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { FormField, Input, Select, Button } from '../components/FormField';
import { PlusCircle, Pencil } from 'lucide-react';

export default function Budget() {
  const [budgets, setBudgets] = useState<BudgetEntry[]>(() => storage.getBudgets());
  const [transactions] = useState(() => storage.getTransactions());
  const [month, setMonth] = useState(currentMonth());
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<BudgetEntry | null>(null);
  const [form, setForm] = useState({ category: EXPENSE_CATEGORIES[0], amount: 0 });

  function saveBudgets(updated: BudgetEntry[]) {
    setBudgets(updated);
    storage.saveBudgets(updated);
  }

  function addOrUpdate() {
    if (form.amount <= 0) return;
    if (editEntry) {
      saveBudgets(budgets.map(b => b.id === editEntry.id ? { ...b, budgetedAmount: form.amount } : b));
    } else {
      const existing = budgets.find(b => b.month === month && b.category === form.category);
      if (existing) {
        saveBudgets(budgets.map(b => b.id === existing.id ? { ...b, budgetedAmount: form.amount } : b));
      } else {
        saveBudgets([...budgets, { id: generateId(), month, category: form.category, budgetedAmount: form.amount }]);
      }
    }
    close();
  }

  function close() {
    setShowModal(false);
    setEditEntry(null);
    setForm({ category: EXPENSE_CATEGORIES[0], amount: 0 });
  }

  function openEdit(entry: BudgetEntry) {
    setEditEntry(entry);
    setForm({ category: entry.category, amount: entry.budgetedAmount });
    setShowModal(true);
  }

  const monthBudgets = budgets.filter(b => b.month === month);
  const monthTx = transactions.filter(t => monthFromDate(t.date) === month && t.type === 'expense');

  const rows = monthBudgets.map(b => {
    const spent = monthTx.filter(t => t.category === b.category).reduce((s, t) => s + t.amount, 0);
    const pct = b.budgetedAmount > 0 ? Math.min((spent / b.budgetedAmount) * 100, 100) : 0;
    const over = spent > b.budgetedAmount;
    return { ...b, spent, pct, over };
  });

  const totalBudgeted = rows.reduce((s, r) => s + r.budgetedAmount, 0);
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);

  const months = Array.from({ length: 13 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#111827' }}>Budget</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <Select value={month} onChange={e => setMonth(e.target.value)} style={{ width: 160 }}>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusCircle size={18} /> Set Budget
          </Button>
        </div>
      </div>

      {rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total budgeted', value: formatCurrency(totalBudgeted), color: '#3b82f6' },
            { label: 'Total spent', value: formatCurrency(totalSpent), color: totalSpent > totalBudgeted ? '#ef4444' : '#10b981' },
            { label: 'Remaining', value: formatCurrency(totalBudgeted - totalSpent), color: totalBudgeted - totalSpent >= 0 ? '#10b981' : '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <Card title={`Budget for ${formatMonth(month)}`}>
        {rows.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '48px 0' }}>
            No budgets set for this month. Click "Set Budget" to add one.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {rows.map(row => (
              <div key={row.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{row.category}</span>
                    <button onClick={() => openEdit(row)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                      <Pencil size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 12, color: '#6b7280' }}>
                    <span style={{ color: row.over ? '#ef4444' : '#374151', fontWeight: row.over ? 700 : 400 }}>
                      {formatCurrency(row.spent)} spent
                    </span>
                    <span>/ {formatCurrency(row.budgetedAmount)}</span>
                    {row.over && <span style={{ color: '#ef4444', fontWeight: 700 }}>OVER!</span>}
                  </div>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 8, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 8,
                    background: row.over ? '#ef4444' : row.pct > 80 ? '#f59e0b' : '#10b981',
                    width: `${row.pct}%`, transition: 'width 0.3s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showModal && (
        <Modal title={editEntry ? 'Edit Budget' : 'Set Budget'} onClose={close}>
          {!editEntry && (
            <FormField label="Category">
              <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormField>
          )}
          {editEntry && (
            <FormField label="Category">
              <Input value={editEntry.category} disabled />
            </FormField>
          )}
          <FormField label="Monthly budget (€)">
            <Input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
            />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={addOrUpdate}>{editEntry ? 'Save' : 'Add'}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
