import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { API_BASE } from '../config/api';

type Movimentacao = {
  id: string;
  valor: number;
  origem: string;
  data: string;
  dataFormatada: string;
};

export default function HistoricoScreen() {
  const router = useRouter();
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [filtroData, setFiltroData] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [filtrar, setFiltrar] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token) return;
  fetch(`${API_BASE}/saldos/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Ordena por data decrescente
          const ordenado = data.slice().sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
          setMovimentacoes(ordenado.map((item: any) => ({
            id: String(item.id),
            valor: item.valor,
            origem: item.origem || (item.valor > 0 ? 'Depósito' : 'Despesa'),
            data: new Date(item.data).toISOString().slice(0, 10),
            dataFormatada: new Date(item.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
          })));
        } else {
          setMovimentacoes([]);
        }
      })
      .catch(() => setMovimentacoes([]));
  }, []);

  const movimentacoesFiltradas = filtrar && filtroData
    ? movimentacoes.filter((item) => item.data === filtroData.toISOString().slice(0, 10))
    : movimentacoes;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>
  <Text style={styles.title}>Movimentações</Text>

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

      <Text style={styles.subTitle}>Movimentações recentes</Text>
      <FlatList
        data={movimentacoesFiltradas}
        keyExtractor={item => item.id}
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
        ListEmptyComponent={<Text style={{ color: '#6b7280', marginTop: 12 }}>Nenhuma movimentação encontrada.</Text>}
        renderItem={({ item }) => (
          <View style={styles.movItem}>
            <MaterialIcons
              name={item.valor > 0 ? 'arrow-upward' : 'arrow-downward'}
              size={24}
              color={item.valor > 0 ? '#22c55e' : '#ef4444'}
              style={styles.icon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.movDescricao}>{item.origem}</Text>
              <Text style={styles.movData}>{item.dataFormatada}</Text>
            </View>
            <Text style={[
              styles.movValor,
              { color: item.valor > 0 ? '#22c55e' : '#ef4444' }
            ]}>
              {item.valor > 0 ? '+ ' : '- '}R${Math.abs(item.valor).toFixed(2)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 12 },
  back: { position: 'absolute', left: 30, top: 60, zIndex: 1 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 24, textAlign: 'center', width: '100%' },
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
  subTitle: { fontSize: 20, fontWeight: '700', color: '#222', alignSelf: 'flex-start', marginLeft: '8%', marginBottom: 8 },
  movItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 10, width: '100%', minHeight: 56, alignSelf: 'center',
  },
  // ...existing code...
  icon: { marginRight: 16 },
  movDescricao: { fontSize: 18, fontWeight: '600', color: '#222' },
  movData: { fontSize: 13, color: '#6B7280' },
  movValor: { fontSize: 18, fontWeight: '700', minWidth: 100, textAlign: 'right' },
});