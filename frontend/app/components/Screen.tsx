import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from 'react-native';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: ViewStyle | ViewStyle[];
  style?: ViewStyle | ViewStyle[];
};

// Componente para unificar layout entre web e mobile (largura máxima e centrado)
export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  contentContainerStyle,
  style,
}) => {
  const inner = (
    <View style={[styles.inner, style]}> 
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {inner}
        </ScrollView>
      ) : inner}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  inner: {
    width: '100%',
    maxWidth: 430, // Largura semelhante a um aparelho celular grande
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
});

export default Screen;
