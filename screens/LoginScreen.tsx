import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export const LoginScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>KASH</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
        {/* Aqui você pode adicionar o formulário de login */}
        <Text style={styles.note}>
          Tela de login será implementada posteriormente
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 16,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#9E9E9E',
    marginBottom: 40,
  },
  note: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
