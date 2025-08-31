import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type SaldoHistorico = {
  id: string;
  valor: number;
  origem: string;
  data: string;
};

export default function SaldoScreen() {
  const router = useRouter();
  const [saldo, setSaldo] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [valor, setValor] = useState('');
  const [origem, setOrigem] = useState('');
  const [historico, setHistorico] = useState<SaldoHistorico[]>([]);

  useEffect(() => {
    fetch('http://192.168.15.11:3001/saldo')
      .then(res => res.json())
      .then(data => setSaldo(data.saldo))
      .catch(() => setSaldo(0));
  }, []);

  const handleColocarSaldo = () => {
    const valorNum = Number(valor.replace(',', '.'));
    if (!valorNum || !origem) {
      Alert.alert('Erro', 'Preencha o valor e a origem');
      return;
    }
    setSaldo(saldo + valorNum);
    setHistorico([
      {
        id: Math.random().toString(),
        valor: valorNum,
        origem,
        data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      },
      ...historico,
    ]);
    setModalVisible(false);
    setValor('');
    setOrigem('');
    // Aqui você pode fazer um POST para o backend se quiser salvar o novo saldo/origem
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#222" />
      </TouchableOpacity>
      <Text style={styles.title}>Meu Saldo</Text>
      <View style={styles.circle}>
        <FontAwesome name="dollar" size={48} color="#fff" />
      </View>
      <Text style={styles.saldo}>
        {`R$${saldo.toFixed(2)}`}
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Colocar saldo</Text>
      </TouchableOpacity>

      {/* Histórico de saldo */}
      <Text style={styles.historicoTitle}>Histórico de saldo</Text>
      <FlatList
        data={historico}
        keyExtractor={item => item.id}
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
        ListEmptyComponent={<Text style={{ color: '#6b7280', marginTop: 12 }}>Nenhuma movimentação ainda.</Text>}
        renderItem={({ item }) => (
          <View style={styles.historicoItem}>
            <FontAwesome name="plus-circle" size={22} color="#22c55e" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.historicoOrigem}>{item.origem}</Text>
              <Text style={styles.historicoData}>{item.data}</Text>
            </View>
            <Text style={styles.historicoValor}>+ R${item.valor.toFixed(2)}</Text>
          </View>
        )}
      />

      {/* Modal para adicionar saldo */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Saldo</Text>
            <TextInput
              style={styles.input}
              placeholder="Valor (ex: 100.00)"
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
            />
            <TextInput
              style={styles.input}
              placeholder="Origem (ex: Salário, Transferência)"
              value={origem}
              onChangeText={setOrigem}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#22c55e' }]} onPress={handleColocarSaldo}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Adicionar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ef4444' }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingTop: 60 },
  back: { position: 'absolute', left: 30, top: 60 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  circle: { backgroundColor: '#22c55e', width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  saldo: { fontSize: 32, fontWeight: '700', marginBottom: 24 },
  button: { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 16, width: '70%', alignItems: 'center' },
  buttonText: { fontSize: 20, color: '#222' },
  historicoTitle: { fontSize: 20, fontWeight: '700', color: '#222', alignSelf: 'flex-start', marginLeft: '8%', marginTop: 24, marginBottom: 8 },
  historicoItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6',
    borderRadius: 12, padding: 14, marginBottom: 10, width: '85%',
  },
  historicoOrigem: { fontSize: 16, fontWeight: '600', color: '#222' },
  historicoData: { fontSize: 12, color: '#6B7280' },
  historicoValor: { fontSize: 18, fontWeight: '700', color: '#22c55e', minWidth: 100, textAlign: 'right' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  modalBtn: { flex: 1, marginHorizontal: 4, borderRadius: 8, padding: 12, alignItems: 'center' },
});