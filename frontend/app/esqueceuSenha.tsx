
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


export default function EsqueceuSenhaScreen() {
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [mostrarSenha, setMostrarSenha] = useState(false);
	const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
	const router = useRouter();

	const API_URL = 'http://localhost:3000';

	const handleTrocarSenha = async () => {
		if (!email || !senha || !confirmarSenha) {
			Alert.alert('Erro', 'Preencha todos os campos');
			return;
		}
		if (senha !== confirmarSenha) {
			Alert.alert('Erro', 'As senhas não coincidem');
			return;
		}
			try {
				const response = await fetch(`${API_URL}/users/reset-password`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, novaSenha: senha })
				});
				let data = null;
				try {
					data = await response.json();
				} catch (e) {
					throw new Error('Resposta inesperada do servidor');
				}
				if (!response.ok) {
					Alert.alert('Erro', data?.error || 'Erro ao redefinir senha');
					return;
				}
						Alert.alert('Sucesso', 'Senha alterada com sucesso!');
						setTimeout(() => {
							router.push('/login');
						}, 1000);
			} catch (err: any) {
				Alert.alert('Erro', err.message || 'Erro ao conectar com o servidor');
			}
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: '#fff' }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
				<Text style={styles.appName}>Recuperar Senha</Text>
				<FontAwesome name="lock" size={64} color="#228B22" style={{ marginBottom: 24 }} />
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
							placeholder="Nova senha"
							placeholderTextColor="#A0AEC0"
							value={senha}
							onChangeText={setSenha}
							secureTextEntry={!mostrarSenha}
						/>
						<TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
							<FontAwesome name={mostrarSenha ? "eye-slash" : "eye"} size={20} color="#6B7280" />
						</TouchableOpacity>
					</View>
					<View style={styles.inputWrapperSenha}>
						<FontAwesome name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
						<TextInput
							style={styles.input}
							placeholder="Confirmar nova senha"
							placeholderTextColor="#A0AEC0"
							value={confirmarSenha}
							onChangeText={setConfirmarSenha}
							secureTextEntry={!mostrarConfirmar}
						/>
						<TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
							<FontAwesome name={mostrarConfirmar ? "eye-slash" : "eye"} size={20} color="#6B7280" />
						</TouchableOpacity>
					</View>
				</View>
				<TouchableOpacity style={styles.button} onPress={handleTrocarSenha}>
					<Text style={styles.buttonText}>Trocar senha</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, backgroundColor: '#fff' },
	appName: { fontSize: 32, fontWeight: 'bold', color: '#228B22', marginBottom: 16, letterSpacing: 2 },
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
		marginTop: 16,
		marginBottom: 32,
	},
	buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
