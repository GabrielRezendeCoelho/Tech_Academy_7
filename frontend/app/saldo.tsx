import React, { useEffect, useState } from "react";
import { useAppAlert } from "./components/AppAlert";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { API_BASE } from "../config/api";
import { storageGet, USER_TOKEN_KEY } from "../utils/storage";
import BackButton from "./components/BackButton";

type SaldoHistorico = {
  id: string;
  valor: number;
  origem: string;
  data: string;
};

export default function SaldoScreen() {
  const alert = useAppAlert();

  const [saldo, setSaldo] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [valor, setValor] = useState("");
  const [origem, setOrigem] = useState("");
  const [historico, setHistorico] = useState<SaldoHistorico[]>([]);
  const [isDespesa, setIsDespesa] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState("");
  const [editOrigem, setEditOrigem] = useState("");

  // Função para abrir modal de edição
  const openEditModal = (item: SaldoHistorico) => {
    setEditId(item.id);
    setEditValor(item.valor.toString());
    setEditOrigem(item.origem);
    setEditModalVisible(true);
  };

  // Função para editar saldo
  const handleEditSaldo = async () => {
    if (!editId || !editValor || !editOrigem) return;
    const token = await storageGet(USER_TOKEN_KEY);
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/saldos/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ valor: Number(editValor), origem: editOrigem }),
      });
      if (!res.ok) {
        Alert.alert("Erro", "Erro ao editar saldo");
        return;
      }
      // Atualiza histórico
      fetch(`${API_BASE}/saldos/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setHistorico(
              data
                .filter((item: any) => item.valor > 0)
                .map((item: any) => ({
                  id: String(item.id),
                  valor: item.valor,
                  origem: item.origem || "Saldo",
                  data: new Date(item.data).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }),
                }))
                .reverse()
            );
          } else {
            setHistorico([]);
          }
        });
      setEditModalVisible(false);
      setEditId(null);
      setEditValor("");
      setEditOrigem("");
      alert.show("Saldo editado com sucesso!");
    } catch {
      Alert.alert("Erro", "Erro ao conectar com o servidor");
    }
  };

  // Função para deletar saldo
  const handleDeleteSaldo = async (id: string) => {
    const token = await storageGet(USER_TOKEN_KEY);
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/saldos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        Alert.alert("Erro", "Erro ao deletar saldo");
        return;
      }
      // Atualiza histórico
      fetch(`${API_BASE}/saldos/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setHistorico(
              data
                .filter((item: any) => item.valor > 0)
                .map((item: any) => ({
                  id: String(item.id),
                  valor: item.valor,
                  origem: item.origem || "Saldo",
                  data: new Date(item.data).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }),
                }))
                .reverse()
            );
          } else {
            setHistorico([]);
          }
        });
      alert.show("Saldo deletado com sucesso!");
    } catch {
      Alert.alert("Erro", "Erro ao conectar com o servidor");
    }
  };

  useEffect(() => {
    (async () => {
      const token = await storageGet(USER_TOKEN_KEY);
      if (!token) return;
      fetch(`${API_BASE}/saldos/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const total = data.reduce((acc, item) => acc + item.valor, 0);
            setSaldo(total);
            setHistorico(
              data
                .filter((item: any) => item.valor > 0)
                .map((item: any) => ({
                  id: String(item.id),
                  valor: item.valor,
                  origem: item.origem || "Saldo",
                  data: new Date(item.data).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }),
                }))
                .reverse()
            );
          } else {
            setSaldo(0);
            setHistorico([]);
          }
        })
        .catch(() => {
          setSaldo(0);
          setHistorico([]);
        });
    })();
  }, []);

  const handleColocarSaldo = async () => {
    let valorNum = Number(valor.replace(",", "."));
    if (!valorNum || !origem) {
      Alert.alert("Erro", "Preencha o valor e a origem");
      return;
    }
    const token = await storageGet(USER_TOKEN_KEY);
    if (!token) {
      Alert.alert("Erro", "Usuário não autenticado");
      return;
    }
    let userId;
    try {
      // Decodifica o token para pegar o userId
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id;
    } catch {
      Alert.alert("Erro", "Token inválido");
      return;
    }
    // Categoria padrão (ex: 1)
    const categoriaId = 1;
    try {
      const res = await fetch(`${API_BASE}/saldos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          valor: valorNum,
          userId,
          categoriaId,
          data: new Date(),
          origem,
        }),
      });
      if (!res.ok) {
        Alert.alert("Erro", "Erro ao salvar saldo no servidor");
        return;
      }
      // Atualiza saldo e histórico após salvar
      fetch(`${API_BASE}/saldos/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const total = data.reduce((acc, item) => acc + item.valor, 0);
            setSaldo(total);
            setHistorico(
              data
                .map((item: any) => ({
                  id: String(item.id),
                  valor: item.valor,
                  origem: item.origem || "Saldo",
                  data: new Date(item.data).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }),
                }))
                .reverse()
            );
          } else {
            setSaldo(0);
            setHistorico([]);
          }
        })
        .catch(() => {
          setSaldo(0);
          setHistorico([]);
        });
      setModalVisible(false);
      setValor("");
      setOrigem("");
      alert.show("Saldo adicionado com sucesso!");
    } catch {
      Alert.alert("Erro", "Erro ao conectar com o servidor");
    }
  };

  return (
    <View style={styles.container}>
      <BackButton to="/menu" />
      <Text style={styles.title}>Meu Saldo</Text>

      {/* Card de saldo (mesmo layout do dashboard) */}
      <View style={styles.saldoCard}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="account-balance-wallet" size={48} color="#fff" />
        </View>
        <Text style={styles.balanceLabel}>Saldo Atual</Text>
        <Text style={styles.balanceValue}>
          R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* Ações */}
      <View style={{ width: "85%", marginBottom: 16 }}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#22c55e" }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons
            name="add-circle-outline"
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.actionBtnText}>Adicionar saldo</Text>
        </TouchableOpacity>
      </View>

      {/* Histórico de saldo */}
      <Text style={styles.historicoTitle}>Histórico de saldo</Text>
      <View style={{ height: 8 }} />
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id}
        style={{ width: "100%" }}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={{ color: "#6b7280", marginTop: 12 }}>
            Nenhuma movimentação ainda.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.historicoItem}>
            <FontAwesome
              name={item.valor >= 0 ? "plus-circle" : "minus-circle"}
              size={22}
              color={item.valor >= 0 ? "#22c55e" : "#ef4444"}
              style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.historicoOrigem}>{item.origem}</Text>
              <Text style={styles.historicoData}>{item.data}</Text>
            </View>
            <Text
              style={[
                styles.historicoValor,
                { color: item.valor >= 0 ? "#22c55e" : "#ef4444" },
              ]}
            >
              {" "}
              {item.valor >= 0 ? "+" : "-"} R${Math.abs(item.valor).toFixed(2)}
            </Text>
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={{ marginLeft: 8 }}
            >
              <MaterialIcons name="edit" size={20} color="#228B22" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteSaldo(item.id)}
              style={{ marginLeft: 8 }}
            >
              <MaterialIcons name="delete" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      />
      {/* Modal para editar saldo */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Saldo</Text>
            <TextInput
              style={styles.input}
              placeholder="Valor (ex: 100.00)"
              keyboardType="numeric"
              value={editValor}
              onChangeText={setEditValor}
            />
            <TextInput
              style={styles.input}
              placeholder="Origem (ex: Salário, Transferência)"
              value={editOrigem}
              onChangeText={setEditOrigem}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#22c55e" }]}
                onPress={handleEditSaldo}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Salvar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ef4444" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para adicionar saldo */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isDespesa ? "Adicionar Despesa" : "Adicionar Saldo"}
            </Text>
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#22c55e" }]}
                onPress={handleColocarSaldo}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Adicionar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ef4444" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    width: "100%",
  },

  // Card igual ao dashboard
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

  // Botão principal
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // Lista
  historicoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    width: "100%", // centraliza a área do texto
    textAlign: "center", // centraliza o texto
    marginTop: 8,
    marginBottom: 8,
  },

  historicoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    width: "100%",
    alignSelf: "center",
  },
  historicoOrigem: { fontSize: 16, fontWeight: "600", color: "#222" },
  historicoData: { fontSize: 12, color: "#6B7280" },
  historicoValor: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22c55e",
    minWidth: 100,
    textAlign: "right",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 480,
    alignItems: "center",
    alignSelf: "center",
  },
  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
});
