import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function GastosExcessivosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gastos excessivos</Text>
      <FontAwesome name="dollar" size={90} color="#ef4444" style={styles.icon} />
      <Text style={styles.text}>
        Monitoramos seus gastos e notificamos você quando seus gastos ultrapassam o limite.
      </Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Entendi</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  icon: { marginBottom: 24 },
  text: { fontSize: 16, color: '#222', marginBottom: 32, textAlign: 'center', width: '80%' },
  button: { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 16, width: '70%', alignItems: 'center' },
  buttonText: { fontSize: 20, color: '#222' },
});