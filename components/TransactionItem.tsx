import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
}

const getIconEmoji = (icon: string): string => {
  switch (icon) {
    case 'shopping-cart': return '🛒';
    case 'calendar': return '📅';
    case 'dollar-sign': return '💰';
    case 'utensils': return '🍽️';
    default: return '⭕';
  }
};

const getIconColor = (type: string): string => {
  switch (type) {
    case 'income': return '#4CAF50';
    case 'expense': return '#F44336';
    default: return '#9E9E9E';
  }
};

const getBackgroundColor = (icon: string): string => {
  switch (icon) {
    case 'shopping-cart': return '#E8F5E8';
    case 'calendar': return '#E3F2FD';
    case 'dollar-sign': return '#E8F5E8';
    case 'utensils': return '#FFF3E0';
    default: return '#F5F5F5';
  }
};

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isPositive = transaction.type === 'income';
  
  return (
    <TouchableOpacity style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor(transaction.icon) }]}>
        <Text style={styles.iconEmoji}>{getIconEmoji(transaction.icon)}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={styles.date}>{transaction.date}</Text>
      </View>
      
      <Text style={[styles.amount, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
        {isPositive ? '+' : '-'}${transaction.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconEmoji: {
    fontSize: 24,
  },
  detailsContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
