import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SettingItem } from "../../src/components/SettingItem";
import { Colors } from "../../src/constants/Colors";
import { useLedgerStore } from "../../src/store/useLedgerStore";

export default function SettingsScreen() {
  const clearAll = useLedgerStore((state) => state.clearAll);

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your ledger records and history. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: () => {
            clearAll();
            Alert.alert("Success", "All local data has been wiped.");
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{ title: "Settings", headerTitleAlign: "center" }}
      />

      {/* App Branding Section - Replaces Profile */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="flash" size={50} color={Colors.primary} />
          </View>
        </View>
        <Text style={styles.userName}>Jolt Ledger</Text>
        <Text style={styles.userEmail}>v1.0.0 (Stable)</Text>
      </View>

      {/* Preferences (Theme Toggle) - RESTORED */}
      <Text style={styles.sectionHeader}>PREFERENCES</Text>
      <View style={styles.themeToggle}>
        <TouchableOpacity style={[styles.toggleBtn, styles.activeToggle]}>
          <Ionicons name="sunny" size={18} color={Colors.primary} />
          <Text style={styles.activeToggleText}>Light</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleBtn}>
          <Ionicons
            name="moon-outline"
            size={18}
            color={Colors.onSurfaceVariant}
          />
          <Text style={styles.toggleText}>Dark</Text>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionHeader}>ACCOUNT</Text>
      <View style={styles.group}>
        <SettingItem
          icon="shield-checkmark-outline"
          label="Security Settings"
          onPress={() => {}}
        />
        <SettingItem
          icon="trash-outline"
          label="Clear All Data"
          onPress={handleClearData}
          color={Colors.error}
        />
      </View>

      {/* Information Section - RESTORED ORIGINAL TEXT */}
      <Text style={styles.sectionHeader}>INFORMATION</Text>
      <View style={styles.group}>
        <SettingItem
          icon="code-slash"
          label="Developer Info"
          value="Continuum Labs"
          color="#883c93"
        />
        <SettingItem
          icon="information-circle-outline"
          label="About the App"
          onPress={() => {}}
          color="#883c93"
        />
        <SettingItem
          icon="ribbon-outline"
          label="Version"
          value="1.0.0 (Stable)"
          color="#883c93"
        />
      </View>

      <Text style={styles.footerText}>
        MADE WITH CARE BY VISHAL • © {new Date().getFullYear()}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 60 },
  profileSection: { alignItems: "center", marginBottom: 32 },
  avatarContainer: { width: 100, height: 100, marginBottom: 16 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  userName: { fontSize: 22, fontWeight: "800", color: Colors.onSurface },
  userEmail: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontWeight: "500",
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.outline,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 24,
    paddingLeft: 8,
  },
  themeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.onSurfaceVariant,
  },
  activeToggleText: { fontSize: 13, fontWeight: "700", color: Colors.primary },
  group: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  footerText: {
    textAlign: "center",
    fontSize: 10,
    color: Colors.outline,
    marginTop: 32,
    fontWeight: "600",
  },
});
