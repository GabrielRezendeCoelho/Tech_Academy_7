import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type HistoricoItem = {
  id: string;
  tipo: string;
  valor: number;
  data: string;
  icone: string;
  cor: string;
};

const historicoInicial: HistoricoItem[] = [
  { id: '1', tipo: 'Depósito', valor: 500, icone: 'arrow-upward', cor: '#22c55e', data: '2023-08-01' },
  { id: '2', tipo: 'Supermercado', valor: -150, icone: 'arrow-downward', cor: '#ef4444', data: '2023-08-02' },
  { id: '3', tipo: 'Transporte', valor: -30, icone: 'directions-bus', cor: '#f59e42', data: '2023-08-03' },
  { id: '4', tipo: 'Depósito', valor: 2000, icone: 'arrow-upward', cor: '#22c55e', data: '2023-08-04' },
];

export default function HistoricoScreen() {
  const router = useRouter();
  const [historico, setHistorico] = useState<HistoricoItem[]>(historicoInicial);

  // Filtro por data
  const [filtroData, setFiltroData] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [filtrar, setFiltrar] = useState(false);

  // Filtro por data selecionada
  const historicoFiltrado = filtrar && filtroData
    ? historico.filter((item) => item.data === filtroData.toISOString().slice(0, 10))
    : historico;

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
        data={historicoFiltrado}
        keyExtractor={item => item.id}
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
        ListEmptyComponent={<Text style={{ color: '#6b7280', marginTop: 12 }}>Nenhuma movimentação encontrada.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <MaterialIcons name={item.icone as any} size={28} color={item.cor} style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemText}>{item.tipo}</Text>
              <Text style={styles.dataText}>{item.data}</Text>
            </View>
            <Text style={[
              styles.valor,
              { color: item.valor > 0 ? '#22c55e' : '#ef4444' }
            ]}>
              {item.valor > 0 ? '+ ' : '- '}R${Math.abs(item.valor)}
            </Text>
          </View>
        )}
      />
    </View>
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
  subTitle: { fontSize: 20, fontWeight: '700', color: '#222', alignSelf: 'flex-start', marginLeft: '8%', marginBottom: 8 },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6',
    borderRadius: 12, padding: 16, marginBottom: 12, width: '85%',
  },
  icon: { marginRight: 16 },
  itemText: { fontSize: 18, fontWeight: '600', color: '#222' },
  dataText: { fontSize: 13, color: '#6B7280' },
  valor: { fontSize: 18, fontWeight: '700', minWidth: 100, textAlign: 'right' },
});