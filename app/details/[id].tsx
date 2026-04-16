import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/Colors";
import { useLedgerStore } from "../../src/store/useLedgerStore";

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // 1. Fetch the specific record and actions from the store
  const record = useLedgerStore((state) =>
    state.records.find((r) => r.id === id),
  );
  const deleteRecord = useLedgerStore((state) => state.deleteRecord);
  const updateRecord = useLedgerStore((state) => state.updateRecord);

  // 2. Safety check: if record isn't found
  if (!record) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Record not found.
        </Text>
      </View>
    );
  }

  // 3. Handlers
  const handleDelete = () => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this ledger item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRecord(record.id);
            router.back();
          },
        },
      ],
    );
  };

  const toggleSkip = () => {
    updateRecord(record.id, { skipNext: !record.skipNext });
  };

  // --- NEW: Navigation to Edit Modal ---
  const handleEdit = () => {
    router.push({
      pathname: "/(modals)/edit-record",
      params: { id: record.id }, // Pass the ID so the edit modal can load the data
    } as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Record Detail",
          headerRight: () => (
            <View style={styles.headerActions}>
              {/* UPDATED: Pencil icon now triggers handleEdit */}
              <TouchableOpacity style={styles.iconBtn} onPress={handleEdit}>
                <Ionicons name="pencil" size={20} color={Colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, styles.deleteBtn]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section - DYNAMIC */}
        <View style={styles.hero}>
          <Text style={styles.title}>{record.title}</Text>
          <Text style={styles.subtitle}>{record.description}</Text>

          {/* Expected Savings & Next Occurrence Row */}
          <View style={styles.expectationRow}>
            <View style={styles.leftInfo}>
              <View style={styles.expectationLabelGroup}>
                <Ionicons name="repeat" size={14} color={Colors.primary} />
                <Text style={styles.expectationLabel}>
                  EXPECTED {record.frequency.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.nextOccurrenceText}>
                Next: {record.nextRun}
              </Text>
            </View>
            <Text style={styles.expectationValue}>{record.amount}</Text>
          </View>

          <View style={styles.totalCard}>
            <View style={styles.totalContent}>
              <Text style={styles.totalLabel}>TOTAL ACCUMULATED</Text>
              <Text style={styles.totalAmount}>
                ₹{Math.floor(record.totalAccumulated)}
                <Text style={styles.decimal}>
                  .{(record.totalAccumulated % 1).toFixed(2).split(".")[1]}
                </Text>
              </Text>
            </View>
            <Ionicons
              name="stats-chart"
              size={32}
              color={Colors.primaryContainer}
            />
          </View>
        </View>

        {/* Primary Action - SKIP TOGGLE */}
        <TouchableOpacity
          style={[
            styles.skipButton,
            record.skipNext && { backgroundColor: Colors.primaryContainer },
          ]}
          activeOpacity={0.7}
          onPress={toggleSkip}
        >
          <Ionicons
            name={record.skipNext ? "play-circle-outline" : "calendar-outline"}
            size={20}
            color={record.skipNext ? Colors.primary : Colors.onSurface}
          />
          <Text
            style={[
              styles.skipText,
              record.skipNext && { color: Colors.primary },
            ]}
          >
            {record.skipNext ? "Resume occurrences" : "Skip next occurrence"}
          </Text>
        </TouchableOpacity>

        {/* History List - DYNAMIC */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          <View style={styles.line} />
          <Text style={styles.entryCount}>{record.history.length} ENTRIES</Text>
        </View>

        <View style={styles.historyList}>
          {record.history.length > 0 ? (
            record.history.map((entry, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.historyDate}>
                      {new Date(entry.timestamp).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                    <Text style={styles.historyStatus}>
                      Successful Recording
                    </Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>{entry.amount}</Text>
                  <Text style={styles.successLabel}>SUCCESS</Text>
                </View>
              </View>
            ))
          ) : (
            <Text
              style={{
                textAlign: "center",
                color: Colors.outline,
                marginTop: 20,
              }}
            >
              No history entries yet.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 24, paddingBottom: 60 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
  },
  deleteBtn: { backgroundColor: "rgba(179, 27, 37, 0.1)" },
  hero: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.onSurface,
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 20 },

  expectationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 88, 186, 0.05)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  leftInfo: {
    flex: 1,
  },
  expectationLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  expectationLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.outline,
    letterSpacing: 0.5,
  },
  nextOccurrenceText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  expectationValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.onSurface,
  },

  totalCard: {
    marginTop: 24,
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  totalContent: { flex: 1 },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.outline,
    letterSpacing: 1,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: -1,
  },
  decimal: { fontSize: 20, opacity: 0.5 },
  skipButton: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 40,
  },
  skipText: { fontWeight: "700", color: Colors.onSurface },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  historyTitle: { fontSize: 18, fontWeight: "800", color: Colors.onSurface },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceContainerLow,
    marginHorizontal: 12,
  },
  entryCount: { fontSize: 10, fontWeight: "bold", color: Colors.outline },
  historyList: { gap: 12 },
  historyItem: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  historyDate: { fontSize: 14, fontWeight: "bold", color: Colors.onSurface },
  historyStatus: { fontSize: 12, color: Colors.onSurfaceVariant },
  historyRight: { alignItems: "flex-end" },
  historyAmount: { fontSize: 16, fontWeight: "bold", color: Colors.onSurface },
  successLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 2,
  },
});
