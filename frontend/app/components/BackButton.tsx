import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  to?: string; // rota para voltar, opcional
};

const BackButton: React.FC<Props> = ({ to }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => (to ? router.push(to as any) : router.back())}
    >
      <MaterialIcons name="arrow-back" size={28} color="#228B22" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 30,
    left: 30,
    zIndex: 2,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
  },
});

export default BackButton;
