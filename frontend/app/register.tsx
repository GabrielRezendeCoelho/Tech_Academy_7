import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const API_URL = 'http://localhost:3000';

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
    if (!name || !email || !cpf || !password || !confirm) {
      setErrorMsg('Preencha todos os campos');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('As senhas não coincidem');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, cpf, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setTimeout(() => {
          router.replace('/login');
        }, 300);
      } else {
        setErrorMsg(data.error || 'Erro ao cadastrar');
      }
    } catch (e) {
      setErrorMsg('Erro ao conectar ao servidor');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <FontAwesome name="money" size={64} color="#228B22" style={{ marginBottom: 24 }} />
        <Text style={styles.title}>Cadastro</Text>
        <View style={styles.inputContainer}>
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
              <FontAwesome name={showCpf ? "eye-slash" : "eye"} size={20} color="#6B7280" />
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
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#6B7280" />
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
              <FontAwesome name={showConfirm ? "eye-slash" : "eye"} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        {errorMsg ? (
          <Text style={{ color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>{errorMsg}</Text>
        ) : null}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.signupLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '600', marginBottom: 24, color: '#222' },
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
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  signupContainer: { flexDirection: 'row', alignItems: 'center' },
  signupText: { fontSize: 16, color: '#374151' },
  signupLink: { fontSize: 16, color: '#228B22', fontWeight: '600', textDecorationLine: 'underline' },
});