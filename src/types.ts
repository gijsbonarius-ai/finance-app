export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  person: 'joint' | 'me' | 'partner';
}

export interface BudgetEntry {
  id: string;
  month: string;
  category: string;
  budgetedAmount: number;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  category: 'savings' | 'investment' | 'property' | 'other';
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  category: 'mortgage' | 'loan' | 'credit_card' | 'other';
}

export const EXPENSE_CATEGORIES = [
  'Housing', 'Food & Groceries', 'Transport', 'Utilities',
  'Healthcare', 'Entertainment', 'Clothing', 'Education',
  'Insurance', 'Personal Care', 'Gifts & Donations', 'Other',
];

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment Returns', 'Rental Income',
  'Benefits', 'Gift', 'Other',
];
