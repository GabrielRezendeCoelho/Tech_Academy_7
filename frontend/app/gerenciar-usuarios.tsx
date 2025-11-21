import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { storageGet, USER_TOKEN_KEY } from "../utils/storage";
import { API_BASE } from "../config/api";

interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  role: "user" | "admin";
  createdAt?: string;
}

export default function GerenciarUsuariosScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedName, setEditedName] = useState("");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
  }, []);

  const checkAdminAccess = async () => {
    const token = await storageGet(USER_TOKEN_KEY);
    if (!token) {
      Alert.alert("Erro", "Token não encontrado. Faça login novamente.");
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserRole(payload.role || "user");
      
      if (payload.role !== "admin") {
        Alert.alert(
          "Acesso Negado",
          "Você não tem permissão para acessar esta área.",
          [{ text: "OK", onPress: () => router.push("/dashboard") }]
        );
      }
    } catch (error) {
      Alert.alert("Erro", "Token inválido.");
      router.push("/login");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await storageGet(USER_TOKEN_KEY);
      if (!token) {
        Alert.alert("Erro", "Token não encontrado.");
        router.push("/login");
        return;
      }

      console.log('[FETCH] Buscando usuários...');
      console.log('[FETCH] URL:', `${API_BASE}/users`);
      console.log('[FETCH] Token:', token.substring(0, 20) + '...');

      const response = await fetch(`${API_BASE}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log('[FETCH] Response status:', response.status);

      if (response.status === 403) {
        Alert.alert(
          "Acesso Negado",
          "Você não tem permissão para visualizar usuários.",
          [{ text: "OK", onPress: () => router.push("/dashboard") }]
        );
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[FETCH] Erro:', errorData);
        throw new Error(errorData.error || "Erro ao buscar usuários");
      }

      const data = await response.json();
      console.log('[FETCH] Usuários carregados:', data.length);
      setUsers(data);
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error);
      Alert.alert("Erro", error.message || "Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleOpenEditModal = (user: User) => {
    console.log('[MODAL] Abrindo modal para usuário:', user.name);
    setSelectedUser(user);
    setEditedName(user.name);
    setEditModalVisible(true);
  };

  const handleSaveNameEdit = async () => {
    console.log('[SAVE] Iniciando salvamento...');
    if (!selectedUser) {
      console.log('[SAVE] Nenhum usuário selecionado');
      return;
    }

    if (!editedName.trim()) {
      showToast("❌ O nome não pode estar vazio");
      return;
    }

    try {
      const token = await storageGet(USER_TOKEN_KEY);
      console.log('[EDIT] Atualizando usuário:', selectedUser.id);
      console.log('[EDIT] URL:', `${API_BASE}/users/${selectedUser.id}`);
      
      const response = await fetch(`${API_BASE}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedName.trim(),
          email: selectedUser.email,
          cpf: selectedUser.cpf,
          role: selectedUser.role,
        }),
      });

      console.log('[EDIT] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[EDIT] Erro:', errorData);
        throw new Error(errorData.error || "Erro ao atualizar nome");
      }

      setEditModalVisible(false);
      showToast(`✅ Nome atualizado: ${editedName}`);
      fetchUsers();
    } catch (error: any) {
      console.error('[EDIT] Exception:', error);
      showToast(`❌ ${error.message || "Erro ao atualizar"}`);
    }
  };

  const handlePromoteToAdmin = async (userId: number, userName: string) => {
    console.log('[PROMOTE] Botão clicado para userId:', userId, 'userName:', userName);
    
    if (Platform.OS === 'web') {
      // No web, usar confirm nativo
      if (!window.confirm(`Deseja promover ${userName} para administrador?`)) {
        return;
      }
      
      try {
        const token = await storageGet(USER_TOKEN_KEY);
        console.log('[PROMOTE] URL:', `${API_BASE}/users/${userId}/promote`);
        
        const response = await fetch(`${API_BASE}/users/${userId}/promote`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log('[PROMOTE] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[PROMOTE] Erro:', errorData);
          throw new Error(errorData.error || "Erro ao promover usuário");
        }

        showToast(`✅ ${userName} agora é admin`);
        fetchUsers();
      } catch (error: any) {
        console.error('[PROMOTE] Exception:', error);
        showToast(`❌ ${error.message || "Erro ao promover"}`);
      }
      return;
    }
    
    // Mobile Alert
    Alert.alert(
      "Promover para Admin",
      `Deseja promover ${userName} para administrador?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Promover",
          onPress: async () => {
            try {
              const token = await storageGet(USER_TOKEN_KEY);
              console.log('[PROMOTE] URL:', `${API_BASE}/users/${userId}/promote`);
              
              const response = await fetch(`${API_BASE}/users/${userId}/promote`, {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              console.log('[PROMOTE] Response status:', response.status);

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[PROMOTE] Erro:', errorData);
                throw new Error(errorData.error || "Erro ao promover usuário");
              }

              showToast(`✅ ${userName} agora é admin`);
              fetchUsers();
            } catch (error: any) {
              console.error('[PROMOTE] Exception:', error);
              showToast(`❌ ${error.message || "Erro ao promover"}`);
            }
          },
        },
      ]
    );
  };

  const handleDemoteFromAdmin = async (userId: number, userName: string) => {
    console.log('[DEMOTE] Botão clicado para userId:', userId, 'userName:', userName);
    
    if (Platform.OS === 'web') {
      if (!window.confirm(`Deseja remover privilégios de administrador de ${userName}?`)) {
        return;
      }
      
      try {
        const token = await storageGet(USER_TOKEN_KEY);
        console.log('[DEMOTE] URL:', `${API_BASE}/users/${userId}/demote`);
        
        const response = await fetch(`${API_BASE}/users/${userId}/demote`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log('[DEMOTE] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[DEMOTE] Erro:', errorData);
          throw new Error(errorData.error || "Erro ao rebaixar usuário");
        }

        showToast(`✅ ${userName} agora é usuário comum`);
        fetchUsers();
      } catch (error: any) {
        console.error('[DEMOTE] Exception:', error);
        showToast(`❌ ${error.message || "Erro ao rebaixar"}`);
      }
      return;
    }
    
    Alert.alert(
      "Remover Admin",
      `Deseja remover privilégios de administrador de ${userName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          onPress: async () => {
            try {
              const token = await storageGet(USER_TOKEN_KEY);
              console.log('[DEMOTE] URL:', `${API_BASE}/users/${userId}/demote`);
              
              const response = await fetch(`${API_BASE}/users/${userId}/demote`, {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              console.log('[DEMOTE] Response status:', response.status);

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[DEMOTE] Erro:', errorData);
                throw new Error(errorData.error || "Erro ao rebaixar usuário");
              }

              showToast(`✅ ${userName} agora é usuário comum`);
              fetchUsers();
            } catch (error: any) {
              console.error('[DEMOTE] Exception:', error);
              showToast(`❌ ${error.message || "Erro ao rebaixar"}`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    console.log('[DELETE] Botão clicado para userId:', userId, 'userName:', userName);
    
    if (Platform.OS === 'web') {
      if (!window.confirm(`⚠️ ATENÇÃO: Tem certeza que deseja excluir permanentemente ${userName}?\n\nEsta ação NÃO pode ser desfeita!`)) {
        return;
      }
      
      try {
        const token = await storageGet(USER_TOKEN_KEY);
        console.log('[DELETE] URL:', `${API_BASE}/users/${userId}`);
        
        const response = await fetch(`${API_BASE}/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log('[DELETE] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[DELETE] Erro:', errorData);
          throw new Error(errorData.error || "Erro ao excluir usuário");
        }

        showToast(`✅ ${userName} foi excluído`);
        fetchUsers();
      } catch (error: any) {
        console.error('[DELETE] Exception:', error);
        showToast(`❌ ${error.message || "Erro ao excluir"}`);
      }
      return;
    }
    
    Alert.alert(
      "⚠️ Excluir Usuário",
      `Tem certeza que deseja excluir permanentemente:\n\n${userName}\n\nEsta ação NÃO pode ser desfeita!`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await storageGet(USER_TOKEN_KEY);
              console.log('[DELETE] URL:', `${API_BASE}/users/${userId}`);
              
              const response = await fetch(`${API_BASE}/users/${userId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              console.log('[DELETE] Response status:', response.status);

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[DELETE] Erro:', errorData);
                throw new Error(errorData.error || "Erro ao excluir usuário");
              }

              showToast(`✅ ${userName} foi excluído`);
              fetchUsers();
            } catch (error: any) {
              console.error('[DELETE] Exception:', error);
              showToast(`❌ ${error.message || "Erro ao excluir"}`);
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userCpf}>CPF: {item.cpf}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text
            style={[
              styles.roleText,
              item.role === "admin" ? styles.adminText : styles.userText,
            ]}
          >
            {item.role === "admin" ? "👑 ADMIN" : "👤 USER"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleOpenEditModal(item)}
        >
          <MaterialIcons name="edit" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        {item.role === "user" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.promoteButton]}
            onPress={() => handlePromoteToAdmin(item.id, item.name)}
          >
            <MaterialIcons name="arrow-upward" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Admin</Text>
          </TouchableOpacity>
        )}

        {item.role === "admin" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.demoteButton]}
            onPress={() => handleDemoteFromAdmin(item.id, item.name)}
          >
            <MaterialIcons name="arrow-downward" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>User</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(item.id, item.name)}
        >
          <MaterialIcons name="delete" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#228B22" />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/menu")}
      >
        <MaterialIcons name="arrow-back" size={28} color="#228B22" />
      </TouchableOpacity>

      <Text style={styles.title}>👑 Gerenciar Usuários</Text>
      <Text style={styles.subtitle}>
        Total: {users.length} usuário{users.length !== 1 ? "s" : ""}
      </Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#228B22"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          </View>
        }
      />

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Editar Nome</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <>
                <Text style={styles.modalLabel}>Usuário:</Text>
                <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>

                <Text style={styles.modalLabel}>Novo Nome:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Digite o novo nome"
                  autoFocus
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={handleSaveNameEdit}
                  >
                    <Text style={styles.modalSaveText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Toast de Feedback */}
      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 12,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  userCpf: {
    fontSize: 12,
    color: "#9ca3af",
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  adminText: {
    color: "#dc2626",
  },
  userText: {
    color: "#2563eb",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: "#3b82f6",
  },
  promoteButton: {
    backgroundColor: "#16a34a",
  },
  demoteButton: {
    backgroundColor: "#f59e0b",
  },
  deleteButton: {
    backgroundColor: "#dc2626",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9ca3af",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 6,
  },
  modalUserEmail: {
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  modalCancelText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  modalSaveButton: {
    backgroundColor: "#228B22",
  },
  modalSaveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toast: {
    position: "absolute",
    bottom: 40,
    left: "10%",
    right: "10%",
    backgroundColor: "#1f2937",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
