import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FAB } from "../src/components/FAB";
import { LedgerCard } from "../src/components/LedgerCard";
import { Colors } from "../src/constants/Colors";
import { reconcileRecords } from "../src/jobs/reconcileRecords";
import { useLedgerStore } from "../src/store/useLedgerStore";

export default function RecordsScreen() {
  const router = useRouter();
  const records = useLedgerStore((state) => state.records);
  const setRecords = useLedgerStore((state) => state.setRecords);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const runBackgroundReconciliation = async () => {
      if (records.length === 0) return;
      setIsSyncing(true);

      // Simulate a small delay for better UX feedback
      setTimeout(() => {
        const updated = reconcileRecords(records);
        if (JSON.stringify(updated) !== JSON.stringify(records)) {
          setRecords(updated);
        }
        setIsSyncing(false);
      }, 800);
    };

    runBackgroundReconciliation();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") runBackgroundReconciliation();
    });

    return () => subscription.remove();
  }, [records.length]);

  const handleNavigate = (id: string) => {
    if (isSyncing) return;
    router.push({ pathname: "/details/[id]", params: { id } } as any);
  };

  // --- FIXED: Formatted Amount with Indian Locale ---
  const { formattedTotal, count } = useMemo(() => {
    const total = records.reduce((acc, rec) => {
      const val = parseFloat(rec.amount.replace(/[^0-9.]/g, "")) || 0;
      return acc + val;
    }, 0);

    return {
      // Formatting the number to ₹ XX,XX,XXX.XX style
      formattedTotal: total.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      count: records.length,
    };
  }, [records]);

  return (
    <View style={styles.container}>
      {isSyncing && <View style={styles.blockingOverlay} />}

      <Stack.Screen
        options={{
          title: "Records",
          headerTitleStyle: styles.headerText,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.background },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.menuButton}
              disabled={isSyncing}
              onPress={() => router.push("/(modals)/settings" as any)}
            >
              <Ionicons
                name="menu-outline"
                size={28}
                color={isSyncing ? Colors.outline : Colors.onSurface}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {isSyncing && (
        <View style={styles.syncBar}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.syncText}>Syncing Ledger...</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollPadding}
        scrollEnabled={!isSyncing}
      >
        {records.length > 0 ? (
          records.map((item) => (
            <LedgerCard
              key={item.id}
              record={item}
              onPress={() => handleNavigate(item.id)}
            />
          ))
        ) : (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text
              style={{ color: Colors.onSurfaceVariant, textAlign: "center" }}
            >
              No records found. Tap the + button to create your first ledger
              entry.
            </Text>
          </View>
        )}

        <View style={styles.insightBox}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTitle}>Current Exposure</Text>
          </View>
          <Text style={styles.insightSub}>
            You have {count} active recurring items totaling{" "}
            <Text style={{ fontWeight: "bold", color: Colors.onSurface }}>
              ₹ {formattedTotal}
            </Text>{" "}
            for the current cycle.
          </Text>
        </View>
      </ScrollView>

      {!isSyncing && (
        <FAB onPress={() => router.push("/(modals)/new-record" as any)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollPadding: { padding: 20, paddingTop: 10, paddingBottom: 100 },
  headerText: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.onSurface,
    fontFamily: "PlusJakartaSans",
  },
  menuButton: { marginLeft: 5, marginRight: 5, padding: 5 },
  blockingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    zIndex: 999,
  },
  syncBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  syncText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  insightBox: {
    backgroundColor: "rgba(0, 88, 186, 0.05)",
    padding: 24,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 88, 186, 0.1)",
  },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  insightTitle: { fontSize: 16, fontWeight: "800", color: Colors.primary },
  insightSub: { fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 18 },
});
