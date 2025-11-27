import React, { useState, useEffect } from "react";
import { useAppAlert } from "./components/AppAlert";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  storageSet,
  storageClear,
  USER_NAME_KEY,
  USER_EMAIL_KEY,
  USER_TOKEN_KEY,
} from "../utils/storage";
import BackButton from "./components/BackButton";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { launchImageLibraryWithValidation, launchCameraWithValidation } from './ImagePickerWrapper';

export default function PerfilScreen() {
  const alert = useAppAlert();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    (async () => {
      const name = await AsyncStorage.getItem(USER_NAME_KEY);
      const email = await AsyncStorage.getItem(USER_EMAIL_KEY);
      if (name) setNome(name);
      if (email) setEmail(email);
      await loadUserProfile();
    })();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
      if (!token) return;

      const res = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.photoUrl) {
          setPhotoUrl(`${API_BASE}${data.photoUrl}`);
        }
      }
    } catch (error) {
      // Falha silenciosa - não quebrar a aplicação
      console.log('Erro ao carregar perfil:', error);
    }
  };

  const pickImage = async () => {
    try {
      setModalPhotoOptions(false);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert.show('Permissão necessária para acessar a galeria');
        return;
      }

      const result = await launchImageLibraryWithValidation();

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validar se é realmente uma imagem
        if (!asset.uri) {
          alert.show('Arquivo inválido. Selecione uma imagem.');
          return;
        }
        
        await uploadPhoto(asset.uri);
      }
    } catch (error: any) {
      console.error('Erro ao selecionar imagem:', error);
      if (error?.message?.includes('Unsupported file type')) {
        alert.show('Tipo de arquivo não suportado. Selecione apenas imagens.');
      } else {
        alert.show('Erro ao selecionar imagem. Tente novamente.');
      }
    }
  };

  const takePhoto = async () => {
    try {
      setModalPhotoOptions(false);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert.show('Permissão necessária para acessar a câmera');
        return;
      }

      const result = await launchCameraWithValidation();

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        if (!asset.uri) {
          alert.show('Erro ao capturar foto. Tente novamente.');
          return;
        }
        
        await uploadPhoto(asset.uri);
      }
    } catch (error: any) {
      console.error('Erro ao tirar foto:', error);
      if (error?.message?.includes('Unsupported file type')) {
        alert.show('Erro com o formato da foto. Tente novamente.');
      } else {
        alert.show('Erro ao tirar foto. Tente novamente.');
      }
    }
  };

  const uploadPhoto = async (uri: string) => {
    setUploading(true);
    try {
      // Validação básica da URI
      if (!uri || uri.trim() === '') {
        alert.show('Arquivo inválido');
        setUploading(false);
        return;
      }

      const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
      if (!token) {
        alert.show('Você precisa estar logado para enviar fotos');
        setUploading(false);
        return;
      }

      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.([\w]+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      
      // Para React Native Web, precisamos criar um blob a partir da URI
      if (uri.startsWith('blob:') || uri.startsWith('http')) {
        try {
          // URI já é um blob ou URL - usar fetch para obter o blob
          const response = await fetch(uri);
          
          if (!response.ok) {
            throw new Error('Não foi possível carregar a imagem');
          }
          
          const blob = await response.blob();
          
          // Validar se é realmente uma imagem
          if (!blob.type.startsWith('image/')) {
            alert.show('Selecione apenas arquivos de imagem');
            setUploading(false);
            return;
          }
          
          formData.append('photo', blob, 'photo.jpg');
        } catch (blobError) {
          console.error('Erro ao processar imagem:', blobError);
          alert.show('Erro ao processar imagem. Tente outro arquivo.');
          setUploading(false);
          return;
        }
      } else {
        // React Native nativo - formato padrão
        formData.append('photo', {
          uri,
          name: filename,
          type,
        } as any);
      }

      const res = await fetch(`${API_BASE}/users/photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // NÃO definir Content-Type - deixar o browser/fetch definir automaticamente com boundary
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || 'Erro ao fazer upload da foto';
        alert.show(errorMsg);
        return;
      }

      setPhotoUrl(`${API_BASE}${data.photoUrl}`);
      alert.show('Foto atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      const errorMsg = error?.message || 'Erro ao fazer upload. Verifique sua conexão.';
      alert.show(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async () => {
    setModalPhotoOptions(false);
    try {
      const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
      if (!token) {
        alert.show('Você precisa estar logado');
        return;
      }

      const res = await fetch(`${API_BASE}/users/photo`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setPhotoUrl(null);
        alert.show('Foto removida com sucesso!');
      } else {
        const data = await res.json();
        alert.show(data.error || 'Erro ao remover foto');
      }
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      alert.show('Erro ao remover foto. Tente novamente.');
    }
  };

  const showPhotoOptions = () => {
    try {
      setModalPhotoOptions(true);
    } catch (error) {
      console.error('Erro ao abrir opções:', error);
      alert.show('Erro ao abrir menu. Tente novamente.');
    }
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEmailVisible, setModalEmailVisible] = useState(false);
  const [senhaEmail, setSenhaEmail] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [modalSenhaVisible, setModalSenhaVisible] = useState(false);
  const [erroSenha, setErroSenha] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  // Deletar usuário
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [senhaDelete, setSenhaDelete] = useState("");
  const [erroDelete, setErroDelete] = useState("");
  const [modalPhotoOptions, setModalPhotoOptions] = useState(false);

  const handleDeletarUsuario = async () => {
    setErroDelete("");
    if (!senhaDelete) {
      setErroDelete("Digite sua senha");
      return;
    }
    const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setErroDelete("Usuário não autenticado");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/users/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senha: senhaDelete }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErroDelete(data.error || "Erro ao deletar usuário");
        return;
      }
      // Limpa localStorage e redireciona para login
      await storageClear();
      setModalDeleteVisible(false);
      setSenhaDelete("");
      setErroDelete("");
      alert.show("Usuário deletado com sucesso!");
      setTimeout(() => router.replace("/login"), 1000);
    } catch {
      setErroDelete("Erro ao conectar com o servidor");
    }
  };

  const handleAlterarEmail = async () => {
    setErroEmail("");
    if (!novoEmail.trim() || !novoEmail.includes("@")) {
      setErroEmail("Digite um email válido");
      return;
    }
    if (!senhaEmail) {
      setErroEmail("Digite sua senha atual");
      return;
    }
    const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setErroEmail("Usuário não autenticado");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/users/update-email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: novoEmail, senhaAtual: senhaEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Senha incorreta") {
          setErroEmail("Senha incorreta");
        } else {
          setErroEmail(data.error || "Erro ao atualizar email");
        }
        return;
      }
      setEmail(novoEmail.trim());
      await storageSet(USER_EMAIL_KEY, novoEmail.trim());
      setModalEmailVisible(false);
      setNovoEmail("");
      setSenhaEmail("");
      setErroEmail("");
      alert.show("Email alterado com sucesso!");
    } catch {
      setErroEmail("Erro ao conectar com o servidor");
    }
  };

  const handleAlterarNome = async () => {
    if (!novoNome.trim()) {
      Alert.alert("Erro", "Digite um nome válido");
      return;
    }
    const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      Alert.alert("Erro", "Usuário não autenticado");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: novoNome }),
      });
      if (!res.ok) {
        Alert.alert("Erro", "Erro ao atualizar nome no servidor");
        return;
      }
      setNome(novoNome.trim());
      await storageSet(USER_NAME_KEY, novoNome.trim());
      setModalVisible(false);
      setNovoNome("");
      alert.show("Nome alterado com sucesso!");
    } catch {
      Alert.alert("Erro", "Erro ao conectar com o servidor");
    }
  };

  const handleAlterarSenha = async () => {
    setErroSenha("");
    if (!senhaAtual || !novaSenha) {
      setErroSenha("Preencha todos os campos");
      return;
    }
    const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setErroSenha("Usuário não autenticado");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/users/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Senha atual incorreta") {
          setErroSenha("Senha atual incorreta");
        } else {
          setErroSenha(data.error || "Erro ao alterar senha");
        }
        return;
      }
      setModalSenhaVisible(false);
      setSenhaAtual("");
      setNovaSenha("");
      setErroSenha("");
      alert.show("Senha alterada com sucesso!");
    } catch {
      setErroSenha("Erro ao conectar com o servidor");
    }
  };

  return (
    <View style={styles.container}>
      <BackButton to="/menu" />
      <Text style={styles.title}>Perfil</Text>

      {/* Card de header com foto de perfil */}
      <View style={styles.headerCard}>
        <TouchableOpacity onPress={showPhotoOptions} style={styles.photoContainer}>
          {uploading ? (
            <View style={styles.iconCircle}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.iconCircle}>
              <MaterialIcons name="account-circle" size={48} color="#fff" />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <MaterialIcons name="camera-alt" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Dados do usuário</Text>
        <Text style={styles.photoHint}>Toque na foto para alterar</Text>
      </View>

      <View style={styles.infoBoxUser}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={styles.labelUser}>Nome:</Text>
          <Text style={styles.nameUser}>{nome}</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{ marginLeft: 8 }}
          >
            <FontAwesome name="pencil" size={20} color="#228B22" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.labelUser}>Email:</Text>
          <Text style={styles.emailUser}>{email}</Text>
          <TouchableOpacity
            onPress={() => setModalEmailVisible(true)}
            style={{ marginLeft: 8 }}
          >
            <FontAwesome name="pencil" size={18} color="#228B22" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Modal para alterar email */}
      <Modal visible={modalEmailVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar email</Text>
            <TextInput
              style={styles.input}
              placeholder="Novo email"
              value={novoEmail}
              onChangeText={setNovoEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha atual"
              value={senhaEmail}
              onChangeText={setSenhaEmail}
              secureTextEntry
            />
            {erroEmail ? (
              <Text style={{ color: "red", marginBottom: 8 }}>{erroEmail}</Text>
            ) : null}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#22c55e" }]}
                onPress={handleAlterarEmail}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Salvar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ef4444" }]}
                onPress={() => {
                  setModalEmailVisible(false);
                  setErroEmail("");
                  setSenhaEmail("");
                  setNovoEmail("");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Text style={styles.info}>Informações pessoais</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalSenhaVisible(true)}
      >
        <Text style={styles.buttonText}>Alterar senha</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ef4444", marginTop: 8 }]}
        onPress={() => setModalDeleteVisible(true)}
      >
        <Text style={[styles.buttonText, { color: "#fff" }]}>
          Deletar minha conta
        </Text>
      </TouchableOpacity>
      {/* Modal para deletar usuário */}
      <Modal visible={modalDeleteVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Deletar conta</Text>
            <Text
              style={{ color: "#ef4444", marginBottom: 12, fontWeight: "bold" }}
            >
              Esta ação é irreversível!
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senhaDelete}
              onChangeText={setSenhaDelete}
              secureTextEntry
            />
            {erroDelete ? (
              <Text style={{ color: "red", marginBottom: 8 }}>
                {erroDelete}
              </Text>
            ) : null}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ef4444" }]}
                onPress={handleDeletarUsuario}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Deletar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#6b7280" }]}
                onPress={() => {
                  setModalDeleteVisible(false);
                  setErroDelete("");
                  setSenhaDelete("");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal para alterar senha */}
      <Modal visible={modalSenhaVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Senha atual"
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Nova senha"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
            />
            {erroSenha ? (
              <Text style={{ color: "red", marginBottom: 8 }}>{erroSenha}</Text>
            ) : null}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#22c55e" }]}
                onPress={handleAlterarSenha}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Salvar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ef4444" }]}
                onPress={() => {
                  setModalSenhaVisible(false);
                  setErroSenha("");
                  setSenhaAtual("");
                  setNovaSenha("");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para alterar nome */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Novo nome"
              value={novoNome}
              onChangeText={setNovoNome}
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
                onPress={handleAlterarNome}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Salvar
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

      {/* Modal de opções de foto */}
      <Modal visible={modalPhotoOptions} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Foto de perfil</Text>
            <Text style={{ color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>
              Escolha uma opção
            </Text>
            
            <TouchableOpacity
              style={[styles.photoOptionBtn, { backgroundColor: '#22c55e' }]}
              onPress={takePhoto}
            >
              <MaterialIcons name="camera-alt" size={24} color="#fff" />
              <Text style={styles.photoOptionText}>Tirar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.photoOptionBtn, { backgroundColor: '#3b82f6' }]}
              onPress={pickImage}
            >
              <MaterialIcons name="photo-library" size={24} color="#fff" />
              <Text style={styles.photoOptionText}>Escolher da galeria</Text>
            </TouchableOpacity>

            {photoUrl && (
              <TouchableOpacity
                style={[styles.photoOptionBtn, { backgroundColor: '#ef4444' }]}
                onPress={deletePhoto}
              >
                <MaterialIcons name="delete" size={24} color="#fff" />
                <Text style={styles.photoOptionText}>Remover foto</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.photoOptionBtn, { backgroundColor: '#6b7280' }]}
              onPress={() => setModalPhotoOptions(false)}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
              <Text style={styles.photoOptionText}>Cancelar</Text>
            </TouchableOpacity>
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
  successBanner: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    backgroundColor: "#22c55e",
    padding: 12,
    alignItems: "center",
    zIndex: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    alignSelf: "center",
    minWidth: "60%",
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  successText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  infoBoxUser: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
    width: "85%",
    alignItems: "flex-start",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  labelUser: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "bold",
    marginRight: 6,
  },
  nameUser: { fontSize: 18, color: "#222", fontWeight: "700" },
  emailUser: { fontSize: 16, color: "#666", fontWeight: "500" },
  back: { position: "absolute", left: 30, top: 60 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    width: "100%",
    color: "#222",
  },

  headerCard: {
    backgroundColor: "#d1fae5",
    borderRadius: 18,
    alignItems: "center",
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 10,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#22c55e',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#22c55e',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerLabel: { fontSize: 16, color: "#374151", fontWeight: '600' },
  photoHint: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    width: "85%",
    textAlign: "center",
    marginVertical: 8,
  },
  info: { fontSize: 16, color: "#6b7280", marginBottom: 24 },
  button: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 16,
    width: "70%",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { fontSize: 18, color: "#222" },
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
  photoOptionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  photoOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
