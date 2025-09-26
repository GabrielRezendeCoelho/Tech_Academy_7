import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE } from "../config/api";
import { storageGet, USER_NAME_KEY, USER_TOKEN_KEY } from "../utils/storage";

export default function DashboardScreen() {
  const router = useRouter();
  const [saldo, setSaldo] = useState<number>(0);
  const [despesas, setDespesas] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      const stored = await storageGet(USER_NAME_KEY);
      if (stored) setName(stored);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const token = await storageGet(USER_TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/saldos/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const totalSaldo = data.reduce(
            (acc: number, item: any) => acc + item.valor,
            0
          );
          const totalDespesas = data
            .filter((item: any) => item.valor < 0)
            .reduce((acc: number, item: any) => acc + Math.abs(item.valor), 0);
          setSaldo(totalSaldo);
          setDespesas(totalDespesas);
        } else {
          setSaldo(0);
          setDespesas(0);
        }
      } catch (e) {
        setSaldo(0);
        setDespesas(0);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  let porcentagem = 0;
  let corPorcentagem = "#22c55e";
  let textoAlerta = "Situação saudável!";
  if (saldo < 0) {
    corPorcentagem = "#b91c1c";
    textoAlerta = "Risco extremo! Seu saldo está negativo!";
    porcentagem = 100;
  } else if (saldo !== null && despesas !== null && saldo > 0) {
    porcentagem = (despesas / saldo) * 100;
    if (porcentagem >= 80) {
      corPorcentagem = "#ef4444";
      textoAlerta = "Atenção! Suas despesas estão muito altas!";
    } else if (porcentagem >= 50) {
      corPorcentagem = "#facc15";
      textoAlerta = "Aviso: Suas despesas estão aumentando.";
    }
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
      {/* Seta ajustada para o canto superior esquerdo e fundo transparente */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: "transparent",
          borderRadius: 0,
          padding: 12,
          zIndex: 1,
        }}
        onPress={() => router.push("/menu")}
      >
        <MaterialIcons name="menu" size={28} color="#222" />
      </TouchableOpacity>

      <View style={styles.saldoCard}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="account-balance-wallet" size={48} color="#fff" />
        </View>
        <Text style={styles.balanceLabel}>Total de Saldo</Text>
        <Text style={styles.balanceValue}>
          R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Total de Despesas</Text>
        <Text style={styles.infoValue}>
          {despesas !== null
            ? `R$ ${despesas.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`
            : "--"}
        </Text>
      </View>

      <View
        style={[
          styles.infoBox,
          { borderColor: corPorcentagem, borderWidth: 2 },
        ]}
      >
        <Text style={styles.infoLabel}>Porcentagem de Despesas</Text>
        <Text style={[styles.infoValue, { color: corPorcentagem }]}>
          {saldo && despesas !== null ? `${porcentagem.toFixed(1)}%` : "--"}
        </Text>
        <Text style={[styles.alerta, { color: corPorcentagem }]}>
          {textoAlerta}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 40,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 24,
    textAlign: "center",
    width: "100%",
  },
  saldoCard: {
    backgroundColor: "#d1fae5",
    borderRadius: 18,
    alignItems: "center",
    padding: 24,
    marginBottom: 24,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    backgroundColor: "#22c55e",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  balanceLabel: { fontSize: 18, color: "#374151", marginBottom: 4 },
  balanceValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#222",
    marginBottom: 0,
  },
  infoBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    width: "85%",
    alignItems: "center",
  },
  infoLabel: { fontSize: 18, color: "#374151", marginBottom: 4 },
  infoValue: { fontSize: 24, fontWeight: "700", color: "#ef4444" },
  alerta: { fontSize: 16, fontWeight: "600", marginTop: 8 },
});
