import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction, FinancialData } from '../types';

interface FinanceContextType {
  financialData: FinancialData;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateBalance: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    category: 'Shopping',
    amount: 150.00,
    description: 'Shopping',
    date: 'April 20',
    icon: 'shopping-cart'
  },
  {
    id: '2',
    type: 'expense',
    category: 'Subscription',
    amount: 30.00,
    description: 'Subscription',
    date: 'April 20',
    icon: 'calendar'
  },
  {
    id: '3',
    type: 'income',
    category: 'Salary',
    amount: 3000.00,
    description: 'Salary',
    date: 'April 20',
    icon: 'dollar-sign'
  },
  {
    id: '4',
    type: 'expense',
    category: 'Dining',
    amount: 45.00,
    description: 'Dining',
    date: 'April 19',
    icon: 'utensils'
  }
];

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const calculateFinancialData = (): FinancialData => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBalance = totalIncome - totalExpenses;

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      transactions
    };
  };

  const [financialData, setFinancialData] = useState<FinancialData>(calculateFinancialData());

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    updateBalance();
  };

  const updateBalance = () => {
    setFinancialData(calculateFinancialData());
  };

  return (
    <FinanceContext.Provider value={{ financialData, addTransaction, updateBalance }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
