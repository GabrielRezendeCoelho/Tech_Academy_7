import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function NotificacoesScreen() {
  const [notificacoes, setNotificacoes] = useState(true);
  const [emails, setEmails] = useState(false);
  const [mensagens, setMensagens] = useState(true);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificações</Text>
      <View style={styles.item}>
        <FontAwesome name="bell" size={28} color="#22c55e" style={styles.icon} />
        <Text style={styles.itemText}>Notificações</Text>
        <Switch value={notificacoes} onValueChange={setNotificacoes} />
      </View>
      <View style={styles.item}>
        <FontAwesome name="envelope" size={28} color="#6b7280" style={styles.icon} />
        <Text style={styles.itemText}>E-mails</Text>
        <Switch value={emails} onValueChange={setEmails} />
      </View>
      <View style={styles.item}>
        <FontAwesome name="comment" size={28} color="#2563eb" style={styles.icon} />
        <Text style={styles.itemText}>Mensagens</Text>
        <Switch value={mensagens} onValueChange={setMensagens} />
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