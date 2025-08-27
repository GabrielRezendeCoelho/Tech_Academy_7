import React from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { HomeScreen } from './screens/HomeScreen';

export default function App() {
  return (
    <FinanceProvider>
      <HomeScreen />
    </FinanceProvider>
  );
}
