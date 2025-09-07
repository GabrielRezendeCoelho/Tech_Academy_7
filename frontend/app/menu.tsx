
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();

  const handleSair = () => {
    Alert.alert('Sair', 'Você saiu do aplicativo.');
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 30, left: 30, zIndex: 2, backgroundColor: '#f3f4f6', borderRadius: 8, padding: 10 }}
        onPress={() => router.push('/dashboard')}
      >
        <MaterialIcons name="arrow-back" size={28} color="#228B22" />
      </TouchableOpacity>
      <Text style={styles.title}>Menu</Text>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/perfil')}>
        <MaterialIcons name="person" size={28} color="#8b5cf6" style={styles.icon} />
        <Text style={styles.itemText}>Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/saldo')}>
        <FontAwesome name="dollar" size={28} color="#22c55e" style={styles.icon} />
        <Text style={styles.itemText}>Meu Saldo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/despesas')}>
        <MaterialIcons name="money-off" size={28} color="#ef4444" style={styles.icon} />
        <Text style={styles.itemText}>Despesas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/historico')}>
        <MaterialIcons name="history" size={28} color="#f59e42" style={styles.icon} />
        <Text style={styles.itemText}>Movimentações</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.item, styles.sair]} onPress={handleSair}>
        <MaterialIcons name="logout" size={28} color="#ef4444" style={styles.icon} />
        <Text style={[styles.itemText, { color: '#ef4444' }]}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingTop: 60 },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#228B22', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 24 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 18, marginBottom: 16, width: '85%' },
  icon: { marginRight: 16 },
  itemText: { fontSize: 20, fontWeight: '600', color: '#222' },
  sair: { backgroundColor: '#fff0f0', borderWidth: 1, borderColor: '#ef4444' },
});