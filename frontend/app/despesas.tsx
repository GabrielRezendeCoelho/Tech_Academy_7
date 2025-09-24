import React, { useState, useEffect } from 'react';
import { useAppAlert } from './components/AppAlert';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { API_BASE } from '../config/api';
import { storageGet, USER_TOKEN_KEY } from '../utils/storage';
import BackButton from './components/BackButton';



export default function DespesasScreen() {
  const alert = useAppAlert();
  const router = useRouter();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataDespesa, setDataDespesa] = useState('');
  const [despesas, setDespesas] = useState<Array<{ id: string; descricao: string; valor: number; data: string }>>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [filtroData, setFiltroData] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [filtrar, setFiltrar] = useState(false);
  // Estados para edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDescricao, setEditDescricao] = useState('');
  const [editValor, setEditValor] = useState('');
  const [editData, setEditData] = useState('');

  // Função para abrir modal de edição
  const openEditModal = (item: { id: string; descricao: string; valor: number; data: string }) => {
    setEditId(item.id);
    setEditDescricao(item.descricao);
    setEditValor(item.valor.toString());
    setEditData(item.data);
    setEditModalVisible(true);
  };

  // Função para editar despesa
  const handleEditDespesa = async () => {
    if (!editId || !editDescricao || !editValor || !editData) return;
  const token = await storageGet(USER_TOKEN_KEY);
    if (!token) return;
    try {
  const res = await fetch(`${API_BASE}/saldos/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ valor: -Math.abs(Number(editValor)), origem: editDescricao, data: editData })
      });
      if (!res.ok) {
        Alert.alert('Erro', 'Erro ao editar despesa');
        return;
      }
      // Atualiza lista após sucesso
  fetch(`${API_BASE}/saldos/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setDespesas(data.filter((item: any) => item.valor < 0).map((item: any) => ({
              id: String(item.id),
              descricao: item.origem || 'Despesa',
              valor: Math.abs(item.valor),
              data: new Date(item.data).toISOString().slice(0, 10)
            })).reverse());
          } else {
            setDespesas([]);
          }
        });
      setEditModalVisible(false);
      setEditId(null);
      setEditDescricao('');
      setEditValor('');
      setEditData('');
      alert.show('Despesa editada com sucesso!');
    } catch {
      Alert.alert('Erro', 'Erro ao conectar com o servidor');
    }
  };

  // Função para deletar despesa
  const handleDeleteDespesa = async (id: string) => {
  const token = await storageGet(USER_TOKEN_KEY);
    if (!token) return;
    try {
  const res = await fetch(`${API_BASE}/saldos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        Alert.alert('Erro', 'Erro ao deletar despesa');
        return;
      }
      // Atualiza lista após sucesso
  fetch(`${API_BASE}/saldos/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setDespesas(data.filter((item: any) => item.valor < 0).map((item: any) => ({
              id: String(item.id),
              descricao: item.origem || 'Despesa',
              valor: Math.abs(item.valor),
              data: new Date(item.data).toISOString().slice(0, 10)
            })).reverse());
          } else {
            setDespesas([]);
          }
        });
      alert.show('Despesa deletada com sucesso!');
    } catch {
      Alert.alert('Erro', 'Erro ao conectar com o servidor');
    }
  };

  useEffect(() => {
    (async () => {
      const token = await storageGet(USER_TOKEN_KEY);
      if (!token) return;
      fetch(`${API_BASE}/saldos/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setDespesas(data.filter((item: any) => item.valor < 0).map((item: any) => ({
              id: String(item.id),
              descricao: item.origem || 'Despesa',
              valor: Math.abs(item.valor),
              data: new Date(item.data).toISOString().slice(0, 10)
            })).reverse());
          } else {
            setDespesas([]);
          }
        })
        .catch(() => setDespesas([]));
    })();
  }, []);

  const adicionarDespesa = async () => {
    if (!descricao || !valor || !dataDespesa) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
  const token = await storageGet(USER_TOKEN_KEY);
    if (!token) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }
    let userId;
    try {
      // Decodifica o token para pegar o userId
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id;
    } catch {
      Alert.alert('Erro', 'Token inválido');
      return;
    }
    // Categoria padrão (ex: 1)
    const categoriaId = 1;
    const valorNegativo = -Math.abs(Number(valor));
    try {
  const res = await fetch(`${API_BASE}/saldos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ valor: valorNegativo, userId, categoriaId, data: dataDespesa, origem: descricao })
      });
      if (!res.ok) {
        Alert.alert('Erro', 'Erro ao registrar despesa no servidor');
        return;
      }
      // Atualiza lista após sucesso
  fetch(`${API_BASE}/saldos/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setDespesas(data.filter((item: any) => item.valor < 0).map((item: any) => ({
              id: String(item.id),
              descricao: item.origem || 'Despesa',
              valor: Math.abs(item.valor),
              data: new Date(item.data).toISOString().slice(0, 10)
            })).reverse());
          } else {
            setDespesas([]);
          }
        })
        .catch(() => setDespesas([]));
  setDescricao('');
  setValor('');
  setDataDespesa('');
  setModalVisible(false);
  alert.show('Despesa adicionada com sucesso!');
    } catch {
      Alert.alert('Erro', 'Erro ao conectar com o servidor');
    }
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
        <BackButton />
        <Text style={styles.title}>Despesas</Text>

        {/* Card de header no padrão do dashboard */}
        <View style={styles.headerCard}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="request-quote" size={40} color="#fff" />
          </View>
          <Text style={styles.headerLabel}>Controle suas despesas</Text>
        </View>

        {/* Botão principal no padrão */}
        <View style={{ width: '85%', marginBottom: 12 }}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="add-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Adicionar despesa</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Lista de despesas</Text>

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
              <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginLeft: 8 }}>
                <MaterialIcons name="edit" size={20} color="#228B22" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteDespesa(item.id)} style={{ marginLeft: 8 }}>
                <MaterialIcons name="delete" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Modal para editar despesa */}
        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Despesa</Text>
              <TextInput
                style={styles.input}
                placeholder="Descrição"
                value={editDescricao}
                onChangeText={setEditDescricao}
              />
              <TextInput
                style={styles.input}
                placeholder="Valor"
                keyboardType="numeric"
                value={editValor}
                onChangeText={setEditValor}
              />
              <TextInput
                style={styles.input}
                placeholder="Data (AAAA-MM-DD)"
                value={editData}
                onChangeText={setEditData}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#22c55e' }]} onPress={handleEditDespesa}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ef4444' }]} onPress={() => setEditModalVisible(false)}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
  </Modal>

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
  container: { flex: 1, alignItems: 'center', paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16, textAlign: 'center', width: '100%', color: '#222' },

  headerCard: {
    backgroundColor: '#d1fae5',
    borderRadius: 18,
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    backgroundColor: '#22c55e',
    width: 74, height: 74, borderRadius: 37,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  headerLabel: { fontSize: 16, color: '#374151' },

  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  sectionTitle: {
    fontSize: 20, fontWeight: '700', color: '#222',
    width: '85%', textAlign: 'center', marginVertical: 8,
  },

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
  backgroundColor: '#22c55e', borderRadius: 8, padding: 16, width: '100%', alignItems: 'center',
  },
  buttonText: { fontSize: 20, color: '#fff' },
  subTitle: { fontSize: 20, fontWeight: '700', color: '#222', alignSelf: 'flex-start', marginLeft: '8%', marginBottom: 8 },
  despesaItem: {
  flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6',
  borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 10, width: '100%', minHeight: 56, alignSelf: 'center',
  },
  icon: { marginRight: 16 },
  despesaDescricao: { fontSize: 18, fontWeight: '600', color: '#222' },
  despesaData: { fontSize: 13, color: '#6B7280' },
  despesaValor: { fontSize: 18, fontWeight: '700', color: '#ef4444', minWidth: 100, textAlign: 'right' },
  modalBg: { backgroundColor: 'rgba(0,0,0,0.4)', flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%', maxWidth: 480,
    borderRadius: 16, padding: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  modalBtn: { flex: 1, marginHorizontal: 4, borderRadius: 8, padding: 12, alignItems: 'center' },
});