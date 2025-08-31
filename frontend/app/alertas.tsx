import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function AlertasScreen() {
  const [alerta, setAlerta] = useState(true);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alertas</Text>
      <View style={styles.item}>
        <FontAwesome name="bell" size={28} color="#22c55e" style={styles.icon} />
        <Text style={styles.itemText}>Alertas</Text>
        <Switch value={alerta} onValueChange={setAlerta} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingTop: 60 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 24 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 18, marginBottom: 16, width: '85%' },
  icon: { marginRight: 16 },
  itemText: { fontSize: 20, fontWeight: '600', color: '#222', flex: 1 },
});