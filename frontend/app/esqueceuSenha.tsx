import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, Alert, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


export default function EsqueceuSenhaScreen() {
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [mostrarSenha, setMostrarSenha] = useState(false);
	const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
	const [loading, setLoading] = useState(false);
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
		setLoading(true);
		try {
			const response = await fetch(`${API_URL}/users/reset-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, novaSenha: senha })
			});
			const data = await response.json();
			if (!response.ok) {
				Alert.alert('Erro', data?.error || 'Erro ao redefinir senha');
				setLoading(false);
				return;
			}
			Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
				{ text: 'OK', onPress: () => router.replace('/login') }
			]);
		} catch (err: any) {
			Alert.alert('Erro', err.message || 'Erro ao conectar com o servidor');
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
							<Text style={[styles.title, styles.center]}>Recuperar senha</Text>

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

							<TouchableOpacity
								style={[styles.button, styles.fullWidthButton, loading && { opacity: 0.7 }]}
								onPress={handleTrocarSenha}
								disabled={loading}
							>
								<Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar instruções'}</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.buttonSecondary, styles.fullWidthButton]}
								onPress={() => router.replace('/login')}
							>
								<Text style={styles.buttonTextSecondary}>Voltar ao login</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: '#f2f9f4' },
	screenWeb: { alignItems: 'center', justifyContent: 'flex-start' },
	mobileWidth: { width: '100%', maxWidth: 430, paddingHorizontal: 20, alignSelf: 'center' },
	center: { width: '100%', textAlign: 'center' },
	fullWidth: { width: '100%' },
	scrollContainer: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 60,
		paddingBottom: 60,
		backgroundColor: '#f2f9f4',
	},
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
	title: { fontSize: 32, fontWeight: '600', marginBottom: 24, color: '#222' },
	inputContainer: { width: '85%', marginBottom: 16 },
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
		marginBottom: 12,
	},
	fullWidthButton: { width: '100%' },
	buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
	buttonSecondary: {
		paddingVertical: 14,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#228B22',
		alignItems: 'center',
		justifyContent: 'center',
		width: '85%',
	},
	buttonTextSecondary: { color: '#228B22', fontSize: 16, fontWeight: '600' },
	error: { color: '#ef4444', marginBottom: 8, textAlign: 'center', paddingHorizontal: 24 },
	success: { color: '#16a34a', marginBottom: 8, textAlign: 'center', fontWeight: '600', paddingHorizontal: 24 },
});
