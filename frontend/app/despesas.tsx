import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePickerModal from "react-native-modal-datetime-picker";

type Despesa = {
  id: string;
  descricao: string;
  valor: number;
  data: string;
};

export default function DespesasScreen() {
  const router = useRouter();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataDespesa, setDataDespesa] = useState('');
  const [despesas, setDespesas] = useState<Despesa[]>([
    { id: '1', descricao: 'Supermercado', valor: 150, data: '2025-08-29' },
    { id: '2', descricao: 'Transporte', valor: 30, data: '2025-08-28' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);

  const [filtroData, setFiltroData] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [filtrar, setFiltrar] = useState(false);

  const adicionarDespesa = () => {
    if (!descricao || !valor || !dataDespesa) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    setDespesas([
      { id: Math.random().toString(), descricao, valor: Number(valor), data: dataDespesa },
      ...despesas,
    ]);
    setDescricao('');
    setValor('');
    setDataDespesa('');
    setModalVisible(false);
  };

  const despesasFiltradas = filtrar && filtroData
    ? despesas.filter((item) => item.data === filtroData.toISOString().slice(0, 10))
    : despesas;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Despesas</Text>

        {/* Botão Filtrar */}
        <View style={styles.filtroRow}>
          <TouchableOpacity
            style={styles.filtrarBtn}
            onPress={() => setDatePickerVisibility(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color="#228B22" />
            <Text style={styles.filtrarBtnText}>
              {filtroData ? filtroData.toLocaleDateString('pt-BR') : 'Selecionar data'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filtrarBtn, { backgroundColor: '#228B22', marginLeft: 8 }]}
            onPress={() => setFiltrar(true)}
            disabled={!filtroData}
          >
            <MaterialIcons name="search" size={20} color="#fff" />
            <Text style={[styles.filtrarBtnText, { color: '#fff' }]}>Filtrar</Text>
          </TouchableOpacity>
          {filtrar && (
            <TouchableOpacity
              style={[styles.filtrarBtn, { backgroundColor: '#ef4444', marginLeft: 8 }]}
              onPress={() => { setFiltrar(false); setFiltroData(null); }}
            >
              <MaterialIcons name="clear" size={20} color="#fff" />
              <Text style={[styles.filtrarBtnText, { color: '#fff' }]}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={date => { setFiltroData(date); setDatePickerVisibility(false); }}
          onCancel={() => setDatePickerVisibility(false)}
        />

        {/* Botão para abrir modal de adicionar despesa */}
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Adicionar despesa</Text>
        </TouchableOpacity>

        <Text style={styles.subTitle}>Despesas recentes</Text>
        <FlatList
          data={despesasFiltradas}
          keyExtractor={item => item.id}
          style={{ width: '100%' }}
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
          ListEmptyComponent={<Text style={{ color: '#6b7280', marginTop: 12 }}>Nenhuma despesa encontrada.</Text>}
          renderItem={({ item }) => (
            <View style={styles.despesaItem}>
              <MaterialIcons name="money-off" size={24} color="#ef4444" style={styles.icon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.despesaDescricao}>{item.descricao}</Text>
                <Text style={styles.despesaData}>{item.data}</Text>
              </View>
              <Text style={styles.despesaValor}>- R${item.valor.toFixed(2)}</Text>
            </View>
          )}
        />

        {/* Modal para adicionar despesa */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Despesa</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="description" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Descrição"
                  placeholderTextColor="#A0AEC0"
                  value={descricao}
                  onChangeText={setDescricao}
                />
              </View>
              <View style={styles.inputWrapperValor}>
                <MaterialIcons name="attach-money" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Valor"
                  placeholderTextColor="#A0AEC0"
                  value={valor}
                  onChangeText={setValor}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="date-range" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Data (AAAA-MM-DD)"
                  placeholderTextColor="#A0AEC0"
                  value={dataDespesa}
                  onChangeText={setDataDespesa}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#22c55e' }]} onPress={adicionarDespesa}>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingTop: 60 },
  back: { position: 'absolute', left: 30, top: 60, zIndex: 1 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 24 },
  filtroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, width: '90%' },
  filtrarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  filtrarBtnText: { marginLeft: 6, fontSize: 15, color: '#228B22', fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F4EA',
    borderRadius: 16, borderWidth: 1, borderColor: '#C7E9D5', marginBottom: 12, paddingHorizontal: 12, height: 52,
  },
  inputWrapperValor: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FF',
    borderRadius: 16, borderWidth: 1, borderColor: '#D1B3FF', marginBottom: 12, paddingHorizontal: 12, height: 52,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#374151' },
  button: {
    backgroundColor: '#228B22', borderRadius: 16, width: '85%', height: 48,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  subTitle: { fontSize: 20, fontWeight: '700', color: '#222', alignSelf: 'flex-start', marginLeft: '8%', marginBottom: 8 },
  despesaItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6',
    borderRadius: 12, padding: 16, marginBottom: 12, width: '85%',
  },
  icon: { marginRight: 16 },
  despesaDescricao: { fontSize: 18, fontWeight: '600', color: '#222' },
  despesaData: { fontSize: 13, color: '#6B7280' },
  despesaValor: { fontSize: 18, fontWeight: '700', color: '#ef4444', minWidth: 100, textAlign: 'right' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  modalBtn: { flex: 1, marginHorizontal: 4, borderRadius: 8, padding: 12, alignItems: 'center' },
});