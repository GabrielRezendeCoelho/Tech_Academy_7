export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface FinancialData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: Transaction[];
}
