import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../src/constants/Colors";

export default function GeneralModal() {
  const router = useRouter();
  const { type } = useLocalSearchParams();

  // If this modal was opened with a specific 'type' param
  if (type === "help") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.text}>
          To create a recurring record, tap the + icon on the home screen.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback: If no type is provided, show a simple info screen
  return (
    <View style={styles.container}>
      <Ionicons name="information-circle" size={48} color={Colors.primary} />
      <Text style={styles.title}>App Information</Text>
      <Text style={styles.text}>Chronos Ledger V1.0.0</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.onSurface,
    marginVertical: 10,
  },
  text: {
    textAlign: "center",
    color: Colors.onSurfaceVariant,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
