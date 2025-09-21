import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_BASE } from '../config/api';
import { storageSet, USER_NAME_KEY, USER_EMAIL_KEY, USER_TOKEN_KEY } from '../utils/storage';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ registered?: string; email?: string }>();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Exibe mensagem se veio do cadastro
  useEffect(() => {
    if (params?.registered && !successMsg) {
      if (params?.email && typeof params.email === 'string') {
        setEmail(params.email);
      }
      setSuccessMsg('Usuário criado com sucesso! Faça login.');
    }
  }, [params]);

  const handleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email || !senha) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }
    const start = Date.now();
    const url = `${API_BASE}/users/login`;
    console.log('[LOGIN] Disparando login', { API_BASE, email });
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha })
      });
      const elapsed = Date.now() - start;
      console.log('[LOGIN] Resposta recebida', { status: response.status, elapsedMs: elapsed });
      let data: any = null;
      try { data = await response.json(); } catch (parseErr) { console.warn('[LOGIN] Falha parse JSON', parseErr); }
      if (!response.ok) {
        const motivo = data?.error || `Status ${response.status}`;
        setErrorMsg(`Falha no login: ${motivo}`);
        console.warn('[LOGIN] Status não OK', { status: response.status, body: data });
        return;
      }
      if (!data?.user || !data?.token) {
        setErrorMsg('Resposta inesperada do servidor (dados ausentes).');
        console.warn('[LOGIN] Estrutura inesperada', data);
        return;
      }
      try {
        await storageSet(USER_NAME_KEY, data.user.name);
        await storageSet(USER_EMAIL_KEY, data.user.email);
        await storageSet(USER_TOKEN_KEY, data.token);
      } catch (storageErr) {
        console.warn('[LOGIN] Erro ao salvar storage', storageErr);
      }
      setSuccessMsg('Login realizado com sucesso! Redirecionando...');
      console.log('[LOGIN] Sucesso; navegando para dashboard');
      setTimeout(() => router.push('/dashboard'), 600);
    } catch (err: any) {
      console.error('[LOGIN] Erro fetch', { message: err?.message, stack: err?.stack, API_BASE, url });
      setErrorMsg(`Erro de rede: ${err?.message || 'não foi possível conectar ao servidor'}`);
    } finally {
      setLoading(false);
    }
  };

  const isWeb = Platform.OS === 'web';
  return (
    <KeyboardAvoidingView
      style={[styles.screen, isWeb && styles.screenWeb]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, isWeb && styles.scrollContainerWeb]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={isWeb ? styles.webCard : undefined}>
          <Text style={styles.appName}>Login</Text>
          <FontAwesome name="money" size={64} color="#228B22" style={{ marginBottom: 24 }} />
          <View style={[styles.inputContainer, isWeb && styles.fullWidth]}>
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
          <TouchableOpacity onPress={() => router.push('/esqueceuSenha')}>
            <Text style={styles.forgot}>Esqueceu a senha?</Text>
          </TouchableOpacity>
          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
          {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}
          <TouchableOpacity
            style={[styles.button, isWeb && styles.fullWidthButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f2f9f4' },
  screenWeb: { backgroundColor: '#f2f9f4' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, backgroundColor: '#f2f9f4', paddingBottom: 60 },
  scrollContainerWeb: { paddingTop: 40, paddingBottom: 40 },
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
    alignItems: 'center'
  },
  appName: { fontSize: 36, fontWeight: 'bold', color: '#228B22', marginBottom: 16, letterSpacing: 2, textAlign: 'center', width: '100%' },
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
  fullWidth: { width: '100%' },
  fullWidthButton: { width: '100%' },
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
  error: { color: '#ef4444', marginBottom: 12, textAlign: 'center', paddingHorizontal: 24 },
  success: { color: '#16a34a', marginBottom: 12, textAlign: 'center', fontWeight: '600', paddingHorizontal: 24 },
});