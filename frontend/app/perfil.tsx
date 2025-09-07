import React, { useState, useEffect } from 'react';
import { useAppAlert } from './components/AppAlert';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const alert = useAppAlert();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNome(localStorage.getItem('userName') || '');
      setEmail(localStorage.getItem('userEmail') || '');
    }
  }, []);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEmailVisible, setModalEmailVisible] = useState(false);
  const [senhaEmail, setSenhaEmail] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [modalSenhaVisible, setModalSenhaVisible] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  // Deletar usuário
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [senhaDelete, setSenhaDelete] = useState('');
  const [erroDelete, setErroDelete] = useState('');

  const handleDeletarUsuario = async () => {
    setErroDelete('');
    if (!senhaDelete) {
      setErroDelete('Digite sua senha');
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token) {
      setErroDelete('Usuário não autenticado');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ senha: senhaDelete })
      });
      const data = await res.json();
      if (!res.ok) {
        setErroDelete(data.error || 'Erro ao deletar usuário');
        return;
      }
      // Limpa localStorage e redireciona para login
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      setModalDeleteVisible(false);
      setSenhaDelete('');
      setErroDelete('');
      alert.show('Usuário deletado com sucesso!');
      setTimeout(() => router.replace('/login'), 1000);
    } catch {
      setErroDelete('Erro ao conectar com o servidor');
    }
  };

  const handleAlterarEmail = async () => {
    setErroEmail('');
    if (!novoEmail.trim() || !novoEmail.includes('@')) {
      setErroEmail('Digite um email válido');
      return;
    }
    if (!senhaEmail) {
      setErroEmail('Digite sua senha atual');
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token) {
      setErroEmail('Usuário não autenticado');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/users/update-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: novoEmail, senhaAtual: senhaEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'Senha incorreta') {
          setErroEmail('Senha incorreta');
        } else {
          setErroEmail(data.error || 'Erro ao atualizar email');
        }
        return;
      }
      setEmail(novoEmail.trim());
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', novoEmail.trim());
      }
      setModalEmailVisible(false);
      setNovoEmail('');
      setSenhaEmail('');
      setErroEmail('');
  alert.show('Email alterado com sucesso!');
    } catch {
      setErroEmail('Erro ao conectar com o servidor');
    }
  };

  const handleAlterarNome = async () => {
    if (!novoNome.trim()) {
      Alert.alert('Erro', 'Digite um nome válido');
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: novoNome })
      });
      if (!res.ok) {
        Alert.alert('Erro', 'Erro ao atualizar nome no servidor');
        return;
      }
      setNome(novoNome.trim());
      if (typeof window !== 'undefined') {
        localStorage.setItem('userName', novoNome.trim());
      }
      setModalVisible(false);
      setNovoNome('');
  alert.show('Nome alterado com sucesso!');
    } catch {
      Alert.alert('Erro', 'Erro ao conectar com o servidor');
    }
  };

  const handleAlterarSenha = async () => {
    setErroSenha('');
    if (!senhaAtual || !novaSenha) {
      setErroSenha('Preencha todos os campos');
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token) {
      setErroSenha('Usuário não autenticado');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/users/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ senhaAtual, novaSenha })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'Senha atual incorreta') {
          setErroSenha('Senha atual incorreta');
        } else {
          setErroSenha(data.error || 'Erro ao alterar senha');
        }
        return;
      }
  setModalSenhaVisible(false);
  setSenhaAtual('');
  setNovaSenha('');
  setErroSenha('');
  alert.show('Senha alterada com sucesso!');
    } catch {
      setErroSenha('Erro ao conectar com o servidor');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#222" />
      </TouchableOpacity>
      <Text style={styles.title}>Perfil</Text>
      <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
<View style={styles.infoBoxUser}>
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
    <Text style={styles.labelUser}>Nome:</Text>
    <Text style={styles.nameUser}>{nome}</Text>
    <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginLeft: 8 }}>
      <FontAwesome name="pencil" size={20} color="#228B22" />
    </TouchableOpacity>
  </View>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={styles.labelUser}>Email:</Text>
    <Text style={styles.emailUser}>{email}</Text>
    <TouchableOpacity onPress={() => setModalEmailVisible(true)} style={{ marginLeft: 8 }}>
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
              <Text style={{ color: 'red', marginBottom: 8 }}>{erroEmail}</Text>
            ) : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#22c55e' }]} onPress={handleAlterarEmail}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ef4444' }]} onPress={() => { setModalEmailVisible(false); setErroEmail(''); setSenhaEmail(''); setNovoEmail(''); }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    <Text style={styles.info}>Informações pessoais</Text>
    <TouchableOpacity style={styles.button} onPress={() => setModalSenhaVisible(true)}>
      <Text style={styles.buttonText}>Alterar senha</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.button, { backgroundColor: '#ef4444', marginTop: 8 }]} onPress={() => setModalDeleteVisible(true)}>
      <Text style={[styles.buttonText, { color: '#fff' }]}>Deletar minha conta</Text>
    </TouchableOpacity>
      {/* Modal para deletar usuário */}
      <Modal visible={modalDeleteVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Deletar conta</Text>
            <Text style={{ color: '#ef4444', marginBottom: 12, fontWeight: 'bold' }}>Esta ação é irreversível!</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senhaDelete}
              onChangeText={setSenhaDelete}
              secureTextEntry
            />
            {erroDelete ? (
              <Text style={{ color: 'red', marginBottom: 8 }}>{erroDelete}</Text>
            ) : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ef4444' }]} onPress={handleDeletarUsuario}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Deletar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#6b7280' }]} onPress={() => { setModalDeleteVisible(false); setErroDelete(''); setSenhaDelete(''); }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</Text>
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
              <Text style={{ color: 'red', marginBottom: 8 }}>{erroSenha}</Text>
            ) : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#22c55e' }]} onPress={handleAlterarSenha}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ef4444' }]} onPress={() => { setModalSenhaVisible(false); setErroSenha(''); setSenhaAtual(''); setNovaSenha(''); }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</Text>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#22c55e' }]} onPress={handleAlterarNome}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
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
  successBanner: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    backgroundColor: '#22c55e',
    padding: 12,
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    alignSelf: 'center',
    minWidth: '60%',
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  successText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  infoBoxUser: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
    width: '85%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  labelUser: { fontSize: 16, color: '#374151', fontWeight: 'bold', marginRight: 6 },
  nameUser: { fontSize: 18, color: '#222', fontWeight: '700' },
  emailUser: { fontSize: 16, color: '#666', fontWeight: '500' },
  back: { position: 'absolute', left: 30, top: 60 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  info: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  button: { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 16, width: '70%', alignItems: 'center', marginBottom: 12 },
  buttonText: { fontSize: 18, color: '#222' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  modalBtn: { flex: 1, marginHorizontal: 4, borderRadius: 8, padding: 12, alignItems: 'center' },
});