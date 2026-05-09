import { useState } from 'react';
import { storage } from '../storage';
import type { Asset, Liability } from '../types';
import { formatCurrency, generateId } from '../utils';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { FormField, Input, Select, Button } from '../components/FormField';
import { PlusCircle, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ASSET_CATEGORIES: { value: Asset['category']; label: string }[] = [
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' },
  { value: 'property', label: 'Property' },
  { value: 'other', label: 'Other' },
];

const LIABILITY_CATEGORIES: { value: Liability['category']; label: string }[] = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'loan', label: 'Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
];

const ASSET_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
const LIABILITY_COLORS = ['#ef4444', '#f97316', '#ec4899', '#6b7280'];

type ModalMode = 'asset' | 'liability' | null;

export default function NetWorth() {
  const [assets, setAssets] = useState<Asset[]>(() => storage.getAssets());
  const [liabilities, setLiabilities] = useState<Liability[]>(() => storage.getLiabilities());
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState({ name: '', value: 0, category: 'savings' });

  function saveAssets(updated: Asset[]) { setAssets(updated); storage.saveAssets(updated); }
  function saveLiabilities(updated: Liability[]) { setLiabilities(updated); storage.saveLiabilities(updated); }

  function add() {
    if (!form.name || form.value <= 0) return;
    if (modal === 'asset') {
      saveAssets([...assets, { id: generateId(), name: form.name, value: form.value, category: form.category as Asset['category'] }]);
    } else {
      saveLiabilities([...liabilities, { id: generateId(), name: form.name, amount: form.value, category: form.category as Liability['category'] }]);
    }
    closeModal();
  }

  function closeModal() {
    setModal(null);
    setForm({ name: '', value: 0, category: 'savings' });
  }

  function openModal(mode: ModalMode) {
    setModal(mode);
    setForm({ name: '', value: 0, category: mode === 'asset' ? 'savings' : 'mortgage' });
  }

  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetPieData = ASSET_CATEGORIES
    .map(c => ({ name: c.label, value: assets.filter(a => a.category === c.value).reduce((s, a) => s + a.value, 0) }))
    .filter(d => d.value > 0);

  const liabilityPieData = LIABILITY_CATEGORIES
    .map(c => ({ name: c.label, value: liabilities.filter(l => l.category === c.value).reduce((s, l) => s + l.amount, 0) }))
    .filter(d => d.value > 0);

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 26, fontWeight: 700, color: '#111827' }}>Net Worth</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total assets', value: formatCurrency(totalAssets), color: '#10b981' },
          { label: 'Total liabilities', value: formatCurrency(totalLiabilities), color: '#ef4444' },
          { label: 'Net worth', value: formatCurrency(netWorth), color: netWorth >= 0 ? '#3b82f6' : '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#374151' }}>Assets</h3>
            <Button onClick={() => openModal('asset')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 13 }}>
              <PlusCircle size={15} /> Add
            </Button>
          </div>
          {assets.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No assets added yet.</p>
          ) : (
            <>
              {assets.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>{a.category}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(a.value)}</span>
                    <button onClick={() => saveAssets(assets.filter(x => x.id !== a.id))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#d1d5db' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {assetPieData.length > 0 && (
                <ResponsiveContainer width="100%" height={200} style={{ marginTop: 16 }}>
                  <PieChart>
                    <Pie data={assetPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                      {assetPieData.map((_, i) => <Cell key={i} fill={ASSET_COLORS[i % ASSET_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#374151' }}>Liabilities</h3>
            <Button onClick={() => openModal('liability')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 13 }}>
              <PlusCircle size={15} /> Add
            </Button>
          </div>
          {liabilities.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No liabilities added yet.</p>
          ) : (
            <>
              {liabilities.map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>{l.category.replace('_', ' ')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 700, color: '#ef4444' }}>{formatCurrency(l.amount)}</span>
                    <button onClick={() => saveLiabilities(liabilities.filter(x => x.id !== l.id))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#d1d5db' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {liabilityPieData.length > 0 && (
                <ResponsiveContainer width="100%" height={200} style={{ marginTop: 16 }}>
                  <PieChart>
                    <Pie data={liabilityPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                      {liabilityPieData.map((_, i) => <Cell key={i} fill={LIABILITY_COLORS[i % LIABILITY_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </Card>
      </div>

      {modal && (
        <Modal title={modal === 'asset' ? 'Add Asset' : 'Add Liability'} onClose={closeModal}>
          <FormField label="Name">
            <Input
              type="text"
              placeholder={modal === 'asset' ? 'e.g. Savings account' : 'e.g. Car loan'}
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </FormField>
          <FormField label="Category">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {(modal === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES).map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Value (€)">
            <Input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={form.value || ''} onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
            />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={add}>Add</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
