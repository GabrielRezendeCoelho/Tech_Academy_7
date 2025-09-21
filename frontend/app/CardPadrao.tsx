import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type Props = {
	children?: React.ReactNode;
	style?: ViewStyle | ViewStyle[];
};

const CardPadrao: React.FC<Props> = ({ children, style }) => {
	return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		width: '100%',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		elevation: 3,
		marginBottom: 12,
	},
});

export default CardPadrao;
