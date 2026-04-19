import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "../../src/constants/Colors";
import { HistoryEntry, useLedgerStore } from "../../src/store/useLedgerStore";

type Frequency = "Daily" | "Weekly" | "Monthly" | "Yearly";
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DATES = Array.from({ length: 28 }, (_, i) => (i + 1).toString());

export default function EditRecordModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { records, updateRecord } = useLedgerStore();

  const existingRecord = records.find((r) => r.id === id);

  // --- Form State ---
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [freq, setFreq] = useState<Frequency>("Monthly");
  const [isRecurring, setIsRecurring] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // --- Logic State ---
  const [timeDate, setTimeDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [targetDay, setTargetDay] = useState("Monday");
  const [targetDate, setTargetDate] = useState("15");

  // --- UI State ---
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  // 1. PRE-FILL LOGIC: Load existing data into state
  useEffect(() => {
    if (existingRecord) {
      setTitle(existingRecord.title);
      // Strip currency symbol for editing
      setAmount(existingRecord.amount.replace(/[^0-9.]/g, ""));
      setDesc(existingRecord.description);
      setFreq(existingRecord.frequency);
      setIsRecurring(existingRecord.isRecurring);
      setHistory(existingRecord.history || []);

      const nextDate = new Date(existingRecord.nextRunRaw);
      setTimeDate(nextDate);
      setTempDate(nextDate);

      // Determine target day/date based on existing data
      setTargetDay(DAYS[nextDate.getDay()]);
      setTargetDate(nextDate.getDate().toString());
    }
  }, [existingRecord]);

  // UI Cleanup
  useEffect(() => {
    if (freq !== "Yearly") setShowCalendar(false);
    setShowTimePicker(false);
  }, [freq]);

  const calculateNextOccurrence = () => {
    // If not recurring, we just show the selected timing
    let next = new Date(isRecurring ? new Date() : tempDate);
    next.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);

    if (isRecurring) {
      if (freq === "Daily") {
        if (next <= new Date()) next.setDate(next.getDate() + 1);
      } else if (freq === "Weekly") {
        const targetIdx = DAYS.indexOf(targetDay);
        let diff = (targetIdx + 7 - next.getDay()) % 7;
        if (diff === 0 && next <= new Date()) diff = 7;
        next.setDate(next.getDate() + diff);
      } else if (freq === "Monthly") {
        next.setDate(parseInt(targetDate));
        if (next <= new Date()) next.setMonth(next.getMonth() + 1);
      } else if (freq === "Yearly") {
        next = new Date(tempDate);
        next.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
        if (next <= new Date()) next.setFullYear(next.getFullYear() + 1);
      }
    }

    const timeStr = next.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return {
      display: `${timeStr} | ${next.getDate().toString().padStart(2, "0")} ${next.toLocaleString("default", { month: "short" })} ${next.getFullYear()}`,
      iso: next.toISOString(),
    };
  };

  const handleUpdate = () => {
    try {
      if (!title.trim() || !amount.trim()) {
        Alert.alert("Missing Info", "Title and Amount are required.");
        return;
      }
      const occurrence = calculateNextOccurrence();

      updateRecord(id as string, {
        title: title.trim(),
        amount: `₹ ${parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        description: desc.trim(),
        frequency: freq,
        isRecurring: isRecurring,
        nextRun: occurrence.display,
        nextRunRaw: occurrence.iso,
      });
      router.back();
    } catch (error) {
      Alert.alert("Update Error", "Could not update record.");
    }
  };

  // ... (Keep onTimeChange, onCalendarChange, formatTime etc. same as NewRecord)
  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (selectedDate) setTimeDate(selectedDate);
  };

  const onCalendarChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") setShowCalendar(false);
    if (selectedDate) setTempDate(selectedDate);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDateShort = (date: Date) =>
    date.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 2. FIX HEADER TITLE */}
      <Stack.Screen
        options={{ title: "Edit Record", headerTitleAlign: "center" }}
      />

      <View style={styles.formGroup}>
        <TextInput
          value={title}
          placeholder="Record Title"
          style={styles.titleInput}
          onChangeText={setTitle}
        />

        <View style={styles.amountContainer}>
          <Text style={styles.label}>AMOUNT</Text>
          <View style={styles.amountRow}>
            <TextInput
              value={amount}
              keyboardType="numeric"
              style={styles.amountInput}
              onChangeText={setAmount}
            />
            <Text style={styles.currency}>₹</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>NOTES & DETAILS</Text>
        <TextInput
          value={desc}
          multiline
          style={styles.notesInput}
          onChangeText={setDesc}
        />

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabelInline}>FREQUENCY</Text>
          <Switch
            trackColor={{ false: "#767577", true: Colors.primaryContainer }}
            thumbColor={isRecurring ? Colors.primary : "#f4f3f4"}
            onValueChange={() => setIsRecurring(!isRecurring)}
            value={isRecurring}
          />
        </View>

        {isRecurring && (
          <>
            <View style={styles.tabs}>
              {(["Daily", "Weekly", "Monthly", "Yearly"] as Frequency[]).map(
                (f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFreq(f)}
                    style={[styles.tab, freq === f && styles.activeTab]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        freq === f && styles.activeTabText,
                      ]}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>

            <View style={styles.contextBox}>
              <Text style={styles.contextText}>
                {calculateNextOccurrence().display}
              </Text>
              <View style={styles.grid}>
                {(freq === "Weekly" || freq === "Monthly") && (
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => setShowListModal(true)}
                  >
                    <Text style={styles.gridLabel}>
                      {freq === "Weekly" ? "DAY" : "DATE"}
                    </Text>
                    <Text style={styles.gridInput}>
                      {freq === "Weekly" ? targetDay : targetDate}
                    </Text>
                  </TouchableOpacity>
                )}
                {freq === "Yearly" && (
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => setShowCalendar(true)}
                  >
                    <Text style={styles.gridLabel}>DATE & MONTH</Text>
                    <Text style={styles.gridInput}>
                      {formatDateShort(tempDate)}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.gridLabel}>TIMING</Text>
                  <Text style={styles.gridInput}>{formatTime(timeDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.saveText}>Update Record</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  contentContainer: { padding: 24, paddingBottom: 60 },
  formGroup: { flex: 1, marginBottom: 20 },
  titleInput: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
    color: Colors.onSurface,
  },
  amountContainer: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.primary,
    letterSpacing: 1,
  },
  amountRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  amountInput: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    color: Colors.onSurface,
  },
  currency: { fontWeight: "800", opacity: 0.4, fontSize: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.onSurfaceVariant,
    marginTop: 32,
    marginBottom: 12,
  },
  sectionLabelInline: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.onSurfaceVariant,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: Colors.onSurface,
    textAlignVertical: "top",
    height: 100,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 30,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  activeTab: {
    backgroundColor: Colors.surface,
    borderRadius: 30,
    elevation: 2,
  },
  tabText: { fontSize: 12, fontWeight: "600", color: Colors.onSurfaceVariant },
  activeTabText: { color: Colors.primary, fontWeight: "bold" },
  contextBox: {
    marginTop: 24,
    backgroundColor: Colors.secondaryContainer,
    padding: 20,
    borderRadius: 16,
  },
  contextText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: 16,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: {
    minWidth: "45%",
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.outline,
    marginBottom: 4,
  },
  gridInput: { fontSize: 14, fontWeight: "bold", color: Colors.onSurface },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 50,
    marginTop: 40,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
