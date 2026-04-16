import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

  // --- Main Form State ---
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [freq, setFreq] = useState<Frequency>("Monthly");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // --- Next Occurrence Logic State ---
  const [timeDate, setTimeDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [targetDay, setTargetDay] = useState("Monday");
  const [targetDate, setTargetDate] = useState("15");

  // --- Inline History Form State ---
  const [isAddingHistory, setIsAddingHistory] = useState(false);
  const [histAmount, setHistAmount] = useState("");
  const [histDate, setHistDate] = useState(new Date());
  const [showHistDatePicker, setShowHistDatePicker] = useState(false);

  useEffect(() => {
    if (existingRecord) {
      setTitle(existingRecord.title);
      setAmount(existingRecord.amount.replace(/[^0-9.]/g, ""));
      setDesc(existingRecord.description);
      setFreq(existingRecord.frequency);
      setHistory(existingRecord.history || []);
      setTimeDate(new Date(existingRecord.nextRunRaw));
      setHistAmount(existingRecord.amount.replace(/[^0-9.]/g, ""));
    }
  }, [existingRecord]);

  // --- UI Cleanup Effect ---
  // Hides pickers when user switches between Daily/Weekly/Monthly/Yearly
  useEffect(() => {
    setShowCalendar(false);
    setShowTimePicker(false);
    setShowHistDatePicker(false);
    setShowListModal(false);
  }, [freq]);

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
    return {
      display: `${timeStr} | ${next.getDate().toString().padStart(2, "0")} ${next.toLocaleString("default", { month: "short" })} ${next.getFullYear()}`,
      iso: next.toISOString(),
    };
  };

  const handleConfirmHistory = () => {
    if (!histAmount) {
      Alert.alert("Error", "Enter an amount.");
      return;
    }
    const newEntry: HistoryEntry = {
      timestamp: histDate.toISOString(),
      amount: `₹ ${parseFloat(histAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    };
    setHistory([newEntry, ...history]);
    setIsAddingHistory(false);
    setHistDate(new Date());
  };

  const handleUpdate = () => {
    try {
      if (!title.trim() || !amount.trim()) {
        Alert.alert("Missing Info", "Title and Amount are required.");
        return;
      }
      const occurrence = calculateNextOccurrence();
      const totalAccumulated = history.reduce((acc, curr) => {
        return acc + (parseFloat(curr.amount.replace(/[^0-9.]/g, "")) || 0);
      }, 0);

      updateRecord(id as string, {
        title: title.trim(),
        amount: `₹ ${parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        description: desc.trim(),
        frequency: freq,
        nextRun: occurrence.display,
        nextRunRaw: occurrence.iso,
        history: history,
        totalAccumulated: totalAccumulated,
      });
      router.back();
    } catch (error) {
      Alert.alert("Update Error", "Could not update record.");
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

  const onHistDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") setShowHistDatePicker(false);
    if (selectedDate) setHistDate(selectedDate);
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
      <Stack.Screen
        options={{
          title: "Edit Record",
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: "800" },
        }}
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

        {/* Inline Logic for Primary Frequency Selectors */}
        {showCalendar && freq === "Yearly" && (
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

        {/* --- MANAGE HISTORY SECTION --- */}
        <Text style={styles.sectionLabel}>MANAGE HISTORY</Text>

        {!isAddingHistory ? (
          <TouchableOpacity
            style={styles.addHistoryBtn}
            onPress={() => setIsAddingHistory(true)}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.addHistoryText}>Add previous occurrence</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.inlineHistoryForm}>
            <Text style={styles.formTitle}>New Past Entry</Text>

            <View style={styles.inlineRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.gridLabel}>DATE</Text>
                <TouchableOpacity
                  style={styles.inlinePicker}
                  onPress={() => setShowHistDatePicker(true)}
                >
                  <Text style={styles.inlinePickerText}>
                    {histDate.toLocaleDateString("en-IN")}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.gridLabel}>AMOUNT</Text>
                <TextInput
                  style={styles.inlineAmountInput}
                  value={histAmount}
                  keyboardType="numeric"
                  onChangeText={setHistAmount}
                  placeholder="0.00"
                />
              </View>
            </View>

            {showHistDatePicker && (
              <View
                style={Platform.OS === "ios" ? styles.iosPickerContainer : null}
              >
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    onPress={() => setShowHistDatePicker(false)}
                    style={styles.iosDoneBar}
                  >
                    <Text style={styles.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                )}
                <DateTimePicker
                  value={histDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "calendar"}
                  onChange={onHistDateChange}
                />
              </View>
            )}

            <View style={styles.inlineActions}>
              <TouchableOpacity
                style={styles.inlineCancel}
                onPress={() => setIsAddingHistory(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.inlineConfirm}
                onPress={handleConfirmHistory}
              >
                <Text style={styles.confirmText}>Confirm Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* History List */}
        {history.map((item, index) => (
          <View key={index} style={styles.historyRow}>
            <View>
              <Text style={styles.historyRowDate}>
                {new Date(item.timestamp).toLocaleDateString("en-IN")}
              </Text>
              <Text style={styles.historyRowTime}>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={styles.historyRowAmount}>{item.amount}</Text>
              <TouchableOpacity
                onPress={() =>
                  setHistory(history.filter((_, i) => i !== index))
                }
              >
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {renderSelectionModal()}

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
  addHistoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addHistoryText: { fontWeight: "700", color: Colors.primary },
  inlineHistoryForm: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.onSurface,
    marginBottom: 16,
  },
  inlineRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  inlinePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
  },
  inlinePickerText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.onSurface,
  },
  inlineAmountInput: {
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.onSurface,
  },
  inlineActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  inlineCancel: { padding: 10 },
  cancelText: { color: Colors.outline, fontWeight: "bold", fontSize: 12 },
  inlineConfirm: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  historyRowDate: { fontSize: 14, fontWeight: "600", color: Colors.onSurface },
  historyRowTime: { fontSize: 11, color: Colors.onSurfaceVariant },
  historyRowAmount: { fontWeight: "bold", color: Colors.onSurface },
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
  modalTitle: { fontSize: 18, fontWeight: "bold", color: Colors.onSurface },
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
