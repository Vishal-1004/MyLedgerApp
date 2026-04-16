import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react"; // Added useEffect
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "../../src/constants/Colors";
import { LedgerRecord, useLedgerStore } from "../../src/store/useLedgerStore";

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

export default function NewRecordModal() {
  const router = useRouter();
  const addRecord = useLedgerStore((state) => state.addRecord);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [freq, setFreq] = useState<Frequency>("Monthly");

  const [timeDate, setTimeDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  const [targetDay, setTargetDay] = useState("Monday");
  const [targetDate, setTargetDate] = useState("15");

  // --- UI Cleanup Effect ---
  // This automatically hides the calendar if the user switches away from 'Yearly'
  useEffect(() => {
    if (freq !== "Yearly") {
      setShowCalendar(false);
    }
    // Also clean up time picker when switching frequencies to keep UI clean
    setShowTimePicker(false);
  }, [freq]);

  // --- Precision Occurrence Calculation ---
  const calculateNextOccurrence = () => {
    let next = new Date();
    next.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);

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

    const timeStr = next.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const day = next.getDate().toString().padStart(2, "0");
    const month = next.toLocaleString("default", { month: "short" });
    const year = next.getFullYear();

    return {
      display: `${timeStr} | ${day} ${month} ${year}`,
      iso: next.toISOString(),
    };
  };

  const handleSave = () => {
    try {
      if (!title.trim() && !amount.trim()) {
        Alert.alert(
          "Missing Info",
          "Please provide at least a title or an amount.",
        );
        return;
      }

      const occurrence = calculateNextOccurrence();

      const newRecord: LedgerRecord = {
        id: Date.now().toString(),
        title: title.trim() || "Untitled Record",
        amount: amount
          ? `₹ ${parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
          : "₹ 0.00",
        description: desc.trim() || "No description provided",
        frequency: freq,
        nextRun: occurrence.display,
        nextRunRaw: occurrence.iso,
        totalAccumulated: 0,
        skipNext: false,
        history: [],
        createdAt: new Date().toISOString(),
      };

      addRecord(newRecord as any);

      if (router.canGoBack()) {
        router.back();
      }
    } catch (error) {
      console.error("❌ Failed to save record:", error);
      Alert.alert(
        "Save Error",
        "We couldn't save your record. Please check your storage space and try again.",
        [{ text: "OK" }],
      );
    }
  };

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

  const renderSelectionModal = () => (
    <Modal visible={showListModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select {freq === "Weekly" ? "Day" : "Date"}
            </Text>
            <TouchableOpacity onPress={() => setShowListModal(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={freq === "Weekly" ? DAYS : DATES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  freq === "Weekly" ? setTargetDay(item) : setTargetDate(item);
                  if (Platform.OS === "android") setShowListModal(false);
                }}
              >
                <Text
                  style={[
                    styles.listItemText,
                    (targetDay === item || targetDate === item) && {
                      color: Colors.primary,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.formGroup}>
        <TextInput
          placeholder="Record Title"
          style={styles.titleInput}
          placeholderTextColor="#ccc"
          onChangeText={setTitle}
        />

        <View style={styles.amountContainer}>
          <Text style={styles.label}>AMOUNT</Text>
          <View style={styles.amountRow}>
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.amountInput}
              onChangeText={setAmount}
            />
            <Text style={styles.currency}>₹</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>NOTES & DETAILS</Text>
        <TextInput
          placeholder="Description..."
          multiline
          style={styles.notesInput}
          onChangeText={setDesc}
        />

        <Text style={styles.sectionLabel}>FREQUENCY</Text>
        <View style={styles.tabs}>
          {(["Daily", "Weekly", "Monthly", "Yearly"] as Frequency[]).map(
            (f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFreq(f)}
                style={[styles.tab, freq === f && styles.activeTab]}
              >
                <Text
                  style={[styles.tabText, freq === f && styles.activeTabText]}
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

        {showTimePicker && (
          <View
            style={Platform.OS === "ios" ? styles.iosPickerContainer : null}
          >
            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={styles.iosDoneBar}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            )}
            <DateTimePicker
              value={timeDate}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
            />
          </View>
        )}

        {showCalendar && (
          <View
            style={Platform.OS === "ios" ? styles.iosPickerContainer : null}
          >
            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                style={styles.iosDoneBar}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            )}
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={onCalendarChange}
            />
          </View>
        )}
      </View>

      {renderSelectionModal()}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Record</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "40%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  doneBtnText: { color: Colors.primary, fontWeight: "bold", fontSize: 16 },
  listItem: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.background,
  },
  listItemText: { fontSize: 16, textAlign: "center" },
  iosPickerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 10,
    paddingBottom: 10,
  },
  iosDoneBar: {
    alignItems: "flex-end",
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
});
