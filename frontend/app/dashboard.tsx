import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  // Saldo fixo de 300 reais
  const [saldo, setSaldo] = useState<number>(180);
  const [despesas, setDespesas] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula busca de despesas do backend
    async function fetchDespesas() {
      try {
        // Exemplo: soma dos valores negativos do histórico
        const res = await fetch('http://192.168.15.11:3001/historico');
        const data = await res.json();
        const totalDespesas = data
          .filter((item: any) => item.valor < 0)
          .reduce((acc: number, item: any) => acc + Math.abs(item.valor), 0);
        setDespesas(totalDespesas);
        setLoading(false);
      } catch {
        setDespesas(0);
        setLoading(false);
      }
    }
    fetchDespesas();
  }, []);

  let porcentagem = 0;
  if (saldo !== null && despesas !== null && saldo > 0) {
    porcentagem = (despesas / saldo) * 100;
  }

  // Lógica de cor e alerta
  let corPorcentagem = '#22c55e';
  let textoAlerta = 'Situação saudável!';
  if (porcentagem >= 80) {
    corPorcentagem = '#ef4444';
    textoAlerta = 'Atenção! Suas despesas estão muito altas!';
  } else if (porcentagem >= 50) {
    corPorcentagem = '#facc15';
    textoAlerta = 'Aviso: Suas despesas estão aumentando.';
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#228B22" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botão de Menu */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 40,
          right: 30,
          backgroundColor: '#f3f4f6',
          borderRadius: 8,
          padding: 10,
          zIndex: 1,
        }}
        onPress={() => router.push('/menu')}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Menu</Text>
      </TouchableOpacity>

      {/* Card de Saldo */}
      <View style={styles.saldoCard}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="account-balance-wallet" size={48} color="#fff" />
        </View>
        <Text style={styles.balanceLabel}>Total de Saldo</Text>
        <Text style={styles.balanceValue}>
          R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Total de Despesas</Text>
        <Text style={styles.infoValue}>
          {despesas !== null ? `R$ ${despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
        </Text>
      </View>

      <View style={[styles.infoBox, { borderColor: corPorcentagem, borderWidth: 2 }]}>
        <Text style={styles.infoLabel}>Porcentagem de Despesas</Text>
        <Text style={[styles.infoValue, { color: corPorcentagem }]}>
          {saldo && despesas !== null
            ? `${porcentagem.toFixed(1)}%`
            : '--'}
        </Text>
        <Text style={[styles.alerta, { color: corPorcentagem }]}>{textoAlerta}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 40 },
  saldoCard: {
    backgroundColor: '#d1fae5',
    borderRadius: 18,
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    backgroundColor: '#22c55e', width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  balanceLabel: { fontSize: 18, color: '#374151', marginBottom: 4 },
  balanceValue: { fontSize: 36, fontWeight: '700', color: '#222', marginBottom: 0 },
  infoBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    width: '85%',
    alignItems: 'center',
  },
  infoLabel: { fontSize: 18, color: '#374151', marginBottom: 4 },
  infoValue: { fontSize: 24, fontWeight: '700', color: '#ef4444' },
  alerta: { fontSize: 16, fontWeight: '600', marginTop: 8 },
});