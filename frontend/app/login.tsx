import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_NAME_KEY, USER_EMAIL_KEY, USER_TOKEN_KEY } from '../utils/storage';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email || !senha) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }
    const url = `${API_BASE}/users/login`;
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErrorMsg(data?.error || `Falha no login (status ${res.status})`);
        return;
      }
      await AsyncStorage.setItem(USER_NAME_KEY, data.user.name);
      await AsyncStorage.setItem(USER_EMAIL_KEY, data.user.email);
      await AsyncStorage.setItem(USER_TOKEN_KEY, data.token);
      setSuccessMsg('Login realizado com sucesso! Redirecionando...');
      setTimeout(() => router.replace('/dashboard'), 600);
    } catch (e: any) {
      setErrorMsg(`Erro de rede: ${e?.message || 'não foi possível conectar ao servidor'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, Platform.OS === 'web' && styles.screenWeb]}>
      <View style={Platform.OS === 'web' ? styles.mobileWidth : undefined}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={[styles.scrollContainer]} keyboardShouldPersistTaps="handled">
            <View style={styles.webCard}>
              <FontAwesome name="money" size={64} color="#228B22" style={{ marginBottom: 24 }} />
              <Text style={[styles.title, styles.center]}>Login</Text>

              <View style={[styles.inputContainer, styles.fullWidth]}>
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
                    <FontAwesome name={mostrarSenha ? 'eye-slash' : 'eye'} size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
              {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

              <TouchableOpacity
                style={[styles.button, styles.fullWidthButton, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/esqueceuSenha')} style={{ marginBottom: 12 }}>
                <Text style={{ color: '#374151', textAlign: 'center' }}>Esqueceu a senha?</Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Não tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.signupLink}>Cadastre-se</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f2f9f4',
  },
  screenWeb: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mobileWidth: {
    width: '100%',
    maxWidth: 430,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  center: { width: '100%', textAlign: 'center' },
  fullWidth: { width: '100%' },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#f2f9f4',
    paddingBottom: 60,
  },

  // mesmo card usado no register
  webCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingTop: 56,
    paddingBottom: 48,
    width: '100%',
    maxWidth: 430,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },

  title: { fontSize: 32, fontWeight: '600', marginBottom: 24, color: '#222', textAlign: 'center', width: '100%' },

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

  button: {
    backgroundColor: '#228B22',
    borderRadius: 16,
    width: '85%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  fullWidthButton: { width: '100%' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },

  signupContainer: { flexDirection: 'row', alignItems: 'center' },
  signupText: { fontSize: 16, color: '#374151' },
  signupLink: { fontSize: 16, color: '#228B22', fontWeight: '600', textDecorationLine: 'underline' },

  error: { color: '#ef4444', marginBottom: 12, textAlign: 'center', paddingHorizontal: 24 },
  success: { color: '#16a34a', marginBottom: 12, textAlign: 'center', fontWeight: '600', paddingHorizontal: 24 },
});