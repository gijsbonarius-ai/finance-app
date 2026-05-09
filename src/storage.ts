import type { Transaction, BudgetEntry, Asset, Liability } from './types';

const KEYS = {
  transactions: 'finance_transactions',
  budgets: 'finance_budgets',
  assets: 'finance_assets',
  liabilities: 'finance_liabilities',
};

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  getTransactions: (): Transaction[] => load(KEYS.transactions),
  saveTransactions: (data: Transaction[]) => save(KEYS.transactions, data),

  getBudgets: (): BudgetEntry[] => load(KEYS.budgets),
  saveBudgets: (data: BudgetEntry[]) => save(KEYS.budgets, data),

  getAssets: (): Asset[] => load(KEYS.assets),
  saveAssets: (data: Asset[]) => save(KEYS.assets, data),

  getLiabilities: (): Liability[] => load(KEYS.liabilities),
  saveLiabilities: (data: Liability[]) => save(KEYS.liabilities, data),
};
