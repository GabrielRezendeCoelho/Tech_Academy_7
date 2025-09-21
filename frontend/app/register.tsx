import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE } from '../config/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCpf, setShowCpf] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState('Fraca');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const checkStrength = (pwd: string) => {
    setPassword(pwd);
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) setStrength('Fraca');
    else if (score === 2) setStrength('Média');
    else setStrength('Forte');
  };

  const handleRegister = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!name || !email || !cpf || !password || !confirm) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }
    const url = `${API_BASE}/users`;
    const start = Date.now();
    setLoading(true);
    try {
      console.log('[REGISTER] Enviando cadastro', { url, API_BASE, name, email, cpf });
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, cpf, password }),
      });
      const elapsed = Date.now() - start;
      let data: any = null;
      try { data = await res.json(); } catch (parseErr) { console.warn('[REGISTER] Falha parse JSON', parseErr); }
      console.log('[REGISTER] Resposta', { status: res.status, elapsedMs: elapsed, body: data });
      if (!res.ok) {
        const motivo = data?.error || `Status ${res.status}`;
        setErrorMsg(`Falha no cadastro: ${motivo}`);
        return;
      }
      if (res.ok && data?.user) {
        setSuccessMsg('Cadastro realizado com sucesso!');
      } else {
        setErrorMsg('Resposta inesperada do servidor.');
      }
    } catch (e: any) {
      console.error('[REGISTER] Erro fetch', { message: e?.message, stack: e?.stack, API_BASE, url });
      setErrorMsg(`Erro de rede: ${e?.message || 'não foi possível conectar ao servidor'}`);
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
          <FontAwesome name="money" size={64} color="#228B22" style={{ marginBottom: 24 }} />
          <Text style={styles.title}>Cadastro</Text>
          <View style={[styles.inputContainer, isWeb && styles.fullWidth]}>
            <View style={styles.inputWrapper}>
              <FontAwesome name="user" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#A0AEC0" value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputWrapper}>
              <FontAwesome name="envelope" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#A0AEC0" value={email} onChangeText={setEmail} keyboardType="email-address" />
            </View>
            <View style={styles.inputWrapper}>
              <FontAwesome name="id-card" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="CPF"
                placeholderTextColor="#A0AEC0"
                value={cpf}
                onChangeText={setCpf}
                secureTextEntry={!showCpf}
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={() => setShowCpf(!showCpf)}>
                <FontAwesome name={showCpf ? 'eye-slash' : 'eye'} size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={{ height: 4, backgroundColor: '#E5E5E5', borderRadius: 2, marginBottom: 8 }}>
              <View
                style={{
                  width: strength === 'Forte' ? '100%' : strength === 'Média' ? '60%' : '30%',
                  height: 4,
                  backgroundColor: strength === 'Forte' ? '#22c55e' : strength === 'Média' ? '#facc15' : '#ef4444',
                  borderRadius: 2,
                }}
              />
            </View>
            <Text style={{ alignSelf: 'flex-end', color: '#6B7280', marginBottom: 8, fontSize: 12 }}>{strength}</Text>
            <View style={styles.inputWrapperSenha}>
              <FontAwesome name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={checkStrength}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapperSenha}>
              <FontAwesome name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmação de Senha"
                placeholderTextColor="#A0AEC0"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <FontAwesome name={showConfirm ? 'eye-slash' : 'eye'} size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
          {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}
          {!successMsg && (
            <TouchableOpacity
              style={[styles.button, isWeb && styles.fullWidthButton, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Cadastrar'}</Text>
            </TouchableOpacity>
          )}
          {successMsg && (
            <TouchableOpacity
              style={[styles.buttonSecondary, isWeb && styles.fullWidthButton]}
              onPress={() => router.replace({ pathname: '/login', params: { registered: '1', email } })}
            >
              <Text style={styles.buttonTextSecondary}>Ir para login</Text>
            </TouchableOpacity>
          )}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.signupLink}>Login</Text>
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
  title: { fontSize: 32, fontWeight: '600', marginBottom: 24, color: '#222', textAlign: 'center', width: '100%' },
  inputContainer: { width: '85%', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F4EA',
    borderRadius: 16, borderWidth: 1, borderColor: '#C7E9D5', marginBottom: 16, paddingHorizontal: 12, height: 52,
  },
  inputWrapperSenha: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FF',
    borderRadius: 16, borderWidth: 1, borderColor: '#D1B3FF', marginBottom: 16, paddingHorizontal: 12, height: 52,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#374151' },
  button: {
    backgroundColor: '#228B22', borderRadius: 16, width: '85%', height: 52,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  fullWidth: { width: '100%' },
  fullWidthButton: { width: '100%' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonSecondary: {
    backgroundColor: '#fff', borderRadius: 16, width: '85%', height: 52,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
    borderWidth: 2, borderColor: '#228B22'
  },
  buttonTextSecondary: { color: '#228B22', fontSize: 18, fontWeight: '600' },
  signupContainer: { flexDirection: 'row', alignItems: 'center' },
  signupText: { fontSize: 16, color: '#374151' },
  signupLink: { fontSize: 16, color: '#228B22', fontWeight: '600', textDecorationLine: 'underline' },
  error: { color: '#ef4444', marginBottom: 12, textAlign: 'center', paddingHorizontal: 24 },
  success: { color: '#16a34a', marginBottom: 12, textAlign: 'center', fontWeight: '600', paddingHorizontal: 24 },
});