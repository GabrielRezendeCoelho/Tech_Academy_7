import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OpcoesScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opções</Text>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/alertas')}>
        <FontAwesome name="bell" size={28} color="#ef4444" style={styles.icon} />
        <Text style={styles.itemText}>Alertas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/notificacoes')}>
        <MaterialIcons name="notifications" size={28} color="#8b5cf6" style={styles.icon} />
        <Text style={styles.itemText}>Notificações</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/gastos-excessivos')}>
        <MaterialIcons name="warning" size={28} color="#facc15" style={styles.icon} />
        <Text style={styles.itemText}>Gastos excessivos</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingTop: 60 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 24 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 18, marginBottom: 16, width: '85%' },
  icon: { marginRight: 16 },
  itemText: { fontSize: 20, fontWeight: '600', color: '#222' },
});