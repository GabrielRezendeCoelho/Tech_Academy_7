import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface BalanceCardProps {
  totalBalance: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ totalBalance }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>📈</Text>
      </View>
      
      <Text style={styles.label}>Total Balance</Text>
      <Text style={styles.amount}>${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.incomeButton]}>
          <Text style={styles.buttonText}>Income</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.expenseButton]}>
          <Text style={styles.buttonText}>Expenses</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  label: {
    fontSize: 16,
    color: '#9E9E9E',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  incomeButton: {
    backgroundColor: '#E8F5E8',
  },
  expenseButton: {
    backgroundColor: '#FFEBEE',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
});
