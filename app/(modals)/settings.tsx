import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { SettingItem } from "../../src/components/SettingItem";
import { Colors } from "../../src/constants/Colors";
import { useLedgerStore } from "../../src/store/useLedgerStore";

export default function SettingsScreen() {
  const clearAll = useLedgerStore((state) => state.clearAll);
  const [aboutVisible, setAboutVisible] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your investment records and history. This action cannot be undone.",
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
      ]
    );
  };

  const openLinkedIn = () => {
    Linking.openURL("https://www.linkedin.com/in/vishalky104/");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: "Settings", headerTitleAlign: "center" }} />

      {/* App Branding Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="stats-chart" size={50} color={Colors.primary} />
          </View>
        </View>
        <Text style={styles.userName}>My Ledger</Text>
        <Text style={styles.userEmail}>v1.0.0 (Stable)</Text>
      </View>

      {/* Preferences Section */}
      <Text style={styles.sectionHeader}>PREFERENCES</Text>
      <View style={styles.themeToggle}>
        <TouchableOpacity style={[styles.toggleBtn, styles.activeToggle]}>
          <Ionicons name="sunny" size={18} color={Colors.primary} />
          <Text style={styles.activeToggleText}>Light</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleBtn}>
          <Ionicons name="moon-outline" size={18} color={Colors.onSurfaceVariant} />
          <Text style={styles.toggleText}>Dark</Text>
        </TouchableOpacity>
      </View>

      {/* Unified App & Account Section */}
      <Text style={styles.sectionHeader}>APP DETAILS & DATA</Text>
      <View style={styles.group}>
        <SettingItem
          icon="logo-linkedin"
          label="Developer Info"
          onPress={openLinkedIn}
          color="#0077B5"
          value={<Ionicons name="open-outline" size={16} color={Colors.outline} />}
          showForwardArrow={false}
        />
        <SettingItem
          icon="information-circle-outline"
          label="About My Ledger"
          onPress={() => setAboutVisible(true)}
          color={Colors.primary}
        />
        <SettingItem
          icon="ribbon-outline"
          label="Version"
          value="1.0.0"
          color="#883c93"
        />
        <SettingItem
          icon="trash-outline"
          label="Clear All Data"
          onPress={handleClearData}
          color={Colors.error}
        />
      </View>

      <Text style={styles.footerText}>
        MADE WITH CARE BY VISHAL • © {new Date().getFullYear()}
      </Text>

      {/* About App Modal */}
      <Modal visible={aboutVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>About My Ledger</Text>
            <TouchableOpacity onPress={() => setAboutVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.aboutHeading}>The Vision</Text>
            <Text style={styles.aboutContent}>
              My Ledger was born out of a simple frustration: the fragmentation of modern investing. 
              Between NPS Protean, PF, and various SIPs on Groww, keeping a bird's-eye view of your 
              wealth usually requires opening a dozen apps. My Ledger solves this by centralizing 
              your recurring investments into a single, unified interface.
            </Text>

            <Text style={styles.aboutHeading}>Automation & Discipline</Text>
            <Text style={styles.aboutContent}>
              Wealth is built through consistency. Our intelligent "Catch-up" engine automatically 
              calculates your recurring contributions, ensuring your ledger stays up-to-date without 
              the friction of manual entry. It's about maintaining the discipline of a professional 
              investor with the ease of a modern app.
            </Text>

            <Text style={styles.aboutHeading}>Privacy First</Text>
            <Text style={styles.aboutContent}>
              Your financial data is sensitive. That's why My Ledger is built on a "Local-First" 
              architecture. We use on-device storage (AsyncStorage) which means your data 
              <Text style={{fontWeight: 'bold', color: Colors.primary}}> never leaves your phone.</Text> 
              No servers, no tracking, and no cloud-side vulnerabilities. Just you and your progress.
            </Text>

            <View style={styles.divider} />
            <Text style={styles.versionInfo}>Built by Vishal Yadav • v1.0.0</Text>
          </ScrollView>
        </View>
      </Modal>
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
  userName: { fontSize: 24, fontWeight: "800", color: Colors.onSurface },
  userEmail: { fontSize: 14, color: Colors.onSurfaceVariant, fontWeight: "500" },
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
  activeToggle: { backgroundColor: Colors.surface, elevation: 2, shadowOpacity: 0.05 },
  toggleText: { fontSize: 13, fontWeight: "600", color: Colors.onSurfaceVariant },
  activeToggleText: { fontSize: 13, fontWeight: "700", color: Colors.primary },
  group: { borderRadius: 16, overflow: "hidden", backgroundColor: Colors.surface },
  footerText: { textAlign: "center", fontSize: 10, color: Colors.outline, marginTop: 48, fontWeight: "700", letterSpacing: 1 },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: Colors.background, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 26, fontWeight: "900", color: Colors.onSurface },
  modalBody: { flex: 1 },
  aboutTagline: { fontSize: 18, fontWeight: "700", color: Colors.primary, marginBottom: 24 },
  aboutHeading: { fontSize: 14, fontWeight: "800", color: Colors.onSurface, marginTop: 24, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  aboutContent: { fontSize: 15, color: Colors.onSurfaceVariant, lineHeight: 22, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.outline, opacity: 0.2, marginVertical: 32 },
  versionInfo: { textAlign: 'center', fontSize: 12, color: Colors.outline, fontWeight: '600', marginBottom: 20 }
});