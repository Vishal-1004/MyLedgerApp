import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// 1. History Item Interface
export interface HistoryEntry {
  timestamp: string; // ISO string of when the transaction occurred
  amount: string; // The amount recorded at that specific time
}

// 2. Updated Ledger Record Interface
export interface LedgerRecord {
  id: string;
  title: string;
  description: string;
  amount: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Yearly";
  nextRun: string; // Display: "08:00 PM | 03 Apr 2027"
  nextRunRaw: string; // ISO: "2027-04-03T20:00:00.000Z"

  // --- New Fields ---
  totalAccumulated: number; // Numeric sum of all successful recurrences
  skipNext: boolean; // Whether the user wants to skip the next scheduled run
  history: HistoryEntry[]; // Array of previous successful entries

  createdAt: string;
}

interface LedgerState {
  records: LedgerRecord[];
  addRecord: (record: LedgerRecord) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, updates: Partial<LedgerRecord>) => void;

  // NEW: Added setRecords for the background reconciliation job
  setRecords: (records: LedgerRecord[]) => void;

  // Action to record a successful occurrence
  recordOccurrence: (id: string) => void;

  clearAll: () => void;
}

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set) => ({
      records: [],

      addRecord: (newRecord) =>
        set((state) => ({
          records: [newRecord, ...state.records],
        })),

      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      updateRecord: (id, updates) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),

      // IMPLEMENTATION: Allows overwriting records with the catch-up data
      setRecords: (records) => set({ records }),

      // Senior Feature: Logic to move "Next Run" to "History"
      recordOccurrence: (id) =>
        set((state) => ({
          records: state.records.map((r) => {
            if (r.id === id) {
              const newEntry: HistoryEntry = {
                timestamp: new Date().toISOString(),
                amount: r.amount,
              };

              // Extract numeric value from "INR 1200.00" string for math
              const numericAmount =
                parseFloat(r.amount.replace(/[^0-9.]/g, "")) || 0;

              return {
                ...r,
                totalAccumulated: r.totalAccumulated + numericAmount,
                history: [newEntry, ...r.history],
              };
            }
            return r;
          }),
        })),

      clearAll: () => set({ records: [] }),
    }),
    {
      name: "ledger-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
