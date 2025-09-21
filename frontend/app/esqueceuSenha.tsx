
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE } from '../config/api';


export default function EsqueceuSenhaScreen() {
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [mostrarSenha, setMostrarSenha] = useState(false);
	const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	const router = useRouter();

	const handleTrocarSenha = async () => {
		setErrorMsg('');
		setSuccessMsg('');
		if (!email || !senha || !confirmarSenha) {
			setErrorMsg('Preencha todos os campos.');
			return;
		}
		if (senha !== confirmarSenha) {
			setErrorMsg('As senhas não coincidem.');
			return;
		}
		setLoading(true);
		try {
			const response = await fetch(`${API_BASE}/users/reset-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, novaSenha: senha })
			});
			let data: any = null;
			try { data = await response.json(); } catch (e) { /* ignorar parse */ }
			if (!response.ok) {
				const motivo = data?.error || `Status ${response.status}`;
				setErrorMsg(`Falha ao redefinir: ${motivo}`);
				return;
			}
			setSuccessMsg('Senha alterada com sucesso! Redirecionando...');
			setTimeout(() => router.push('/login'), 1000);
		} catch (err: any) {
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
					<Text style={styles.appName}>Recuperar Senha</Text>
					<FontAwesome name="lock" size={64} color="#228B22" style={{ marginBottom: 24 }} />
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
								placeholder="Nova senha"
								placeholderTextColor="#A0AEC0"
								value={senha}
								onChangeText={setSenha}
								secureTextEntry={!mostrarSenha}
							/>
							<TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
								<FontAwesome name={mostrarSenha ? 'eye-slash' : 'eye'} size={20} color="#6B7280" />
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
								<FontAwesome name={mostrarConfirmar ? 'eye-slash' : 'eye'} size={20} color="#6B7280" />
							</TouchableOpacity>
						</View>
					</View>
					{errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
					{successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}
					<TouchableOpacity
						style={[styles.button, isWeb && styles.fullWidthButton, loading && { opacity: 0.7 }]}
						onPress={handleTrocarSenha}
						disabled={loading}
					>
						<Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Trocar senha'}</Text>
					</TouchableOpacity>
					<View style={styles.signupContainer}>
						<Text style={styles.signupText}>Lembrou a senha? </Text>
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
	appName: { fontSize: 32, fontWeight: 'bold', color: '#228B22', marginBottom: 16, letterSpacing: 2, textAlign: 'center', width: '100%' },
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
		marginTop: 8,
		marginBottom: 32,
	},
	fullWidth: { width: '100%' },
	fullWidthButton: { width: '100%' },
	buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
	signupContainer: { flexDirection: 'row', alignItems: 'center' },
	signupText: { fontSize: 16, color: '#374151' },
	signupLink: { fontSize: 16, color: '#228B22', fontWeight: '600', textDecorationLine: 'underline' },
	error: { color: '#ef4444', marginBottom: 12, textAlign: 'center', paddingHorizontal: 24 },
	success: { color: '#16a34a', marginBottom: 12, textAlign: 'center', fontWeight: '600', paddingHorizontal: 24 },
});
