import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const API_URL = 'http://192.168.15.11:3001';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha }),
      });
      const data = await res.json();
      if (data.token) {
        Alert.alert('Sucesso', 'Login realizado!', [
          { text: 'OK', onPress: () => router.push('/dashboard') },
        ]);
      } else {
        Alert.alert('Erro', data.error || 'Erro ao fazer login');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao conectar ao servidor');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.appName}>Kash</Text>
        <FontAwesome name="money" size={64} color="#228B22" style={{ marginBottom: 24 }} />
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <FontAwesome name="envelope" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#A0AEC0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWrapperSenha}>
            <FontAwesome name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#A0AEC0"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <FontAwesome name={mostrarSenha ? "eye-slash" : "eye"} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.forgot}>Esqueceu a senha?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.signupLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/dashboard')}>
          <Text style={styles.menuButtonText}>Ir para Menu</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, backgroundColor: '#fff' },
  appName: { fontSize: 36, fontWeight: 'bold', color: '#228B22', marginBottom: 16, letterSpacing: 2 },
  inputContainer: { width: '85%', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7E9D5',
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 52,
  },
  inputWrapperSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1B3FF',
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#374151' },
  forgot: { alignSelf: 'flex-end', marginRight: '8%', marginBottom: 24, color: '#374151', fontSize: 15 },
  button: {
    backgroundColor: '#228B22',
    borderRadius: 16,
    width: '85%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  signupContainer: { flexDirection: 'row', alignItems: 'center' },
  signupText: { fontSize: 16, color: '#374151' },
  signupLink: { fontSize: 16, color: '#228B22', fontWeight: '600', textDecorationLine: 'underline' },
  menuButton: {
    marginTop: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    width: '60%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  menuButtonText: {
    color: '#228B22',
    fontSize: 16,
    fontWeight: '600',
  },
});