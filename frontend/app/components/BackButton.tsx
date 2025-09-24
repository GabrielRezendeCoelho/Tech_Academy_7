import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import type { Router } from 'expo-router';

type RouterPushPath = Parameters<Router['push']>[0];

type Props = {
  style?: ViewStyle;
  to?: RouterPushPath; // default: '/menu'
};

export default function BackButton({ style, to = '/menu' }: Props) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[styles.back, style]}
      onPress={() => router.push(to)}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      <MaterialIcons name="arrow-back" size={28} color="#222" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  back: {
    position: 'absolute',
    left: 30,
    top: 60,
    zIndex: 2,
    elevation: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 10,
  },
});