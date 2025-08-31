import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('João Silva');
  const [modalVisible, setModalVisible] = useState(false);
  const [novoNome, setNovoNome] = useState('');

  const handleAlterarNome = () => {
    if (!novoNome.trim()) {
      Alert.alert('Erro', 'Digite um nome válido');
      return;
    }
    setNome(novoNome.trim());
    setModalVisible(false);
    setNovoNome('');
    // Aqui você pode fazer uma requisição para atualizar o nome no backend, se desejar
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#222" />
      </TouchableOpacity>
      <Text style={styles.title}>Perfil</Text>
      <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
      <Text style={styles.name}>{nome}</Text>
      <Text style={styles.info}>Informações pessoais</Text>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Alterar nome</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Esqueceu a senha</Text>
      </TouchableOpacity>

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
  back: { position: 'absolute', left: 30, top: 60 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  info: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  button: { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 16, width: '70%', alignItems: 'center', marginBottom: 12 },
  buttonText: { fontSize: 18, color: '#222' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  modalBtn: { flex: 1, marginHorizontal: 4, borderRadius: 8, padding: 12, alignItems: 'center' },
});