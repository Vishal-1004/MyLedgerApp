import { HistoryEntry, LedgerRecord } from "../store/useLedgerStore";

/**
 * Recalculates the next run date based on frequency.
 */
const getNextDate = (currentDate: Date, frequency: string): Date => {
  const next = new Date(currentDate);
  switch (frequency) {
    case "Daily":
      next.setDate(next.getDate() + 1);
      break;
    case "Weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "Monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "Yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
};

/**
 * Formats date for the 'nextRun' display string
 */
const formatDisplayDate = (date: Date): string => {
  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${timeStr} | ${day} ${month} ${year}`;
};

/**
 * reconcilesRecords
 * Senior Dev Note: This is a pure function for testability.
 * It takes the current state and returns the updated state.
 */
export const reconcileRecords = (records: LedgerRecord[]): LedgerRecord[] => {
  const now = new Date();
  console.log(
    `[Reconciler] 🚀 Starting reconciliation at: ${now.toISOString()}`,
  );

  const updatedRecords = records.map((record) => {
    let nextRunTime = new Date(record.nextRunRaw);

    // Check if the record is due for processing
    if (nextRunTime > now) {
      return record; // Still in the future, no action needed
    }

    console.log(`[Reconciler] 📌 Processing due record: "${record.title}"`);
    let tempRecord = { ...record };
    let iterations = 0;

    // While loop handles missed occurrences (catch-up logic)
    while (nextRunTime <= now) {
      iterations++;

      if (!tempRecord.skipNext) {
        console.log(
          `[Reconciler] ✅ Creating history entry for cycle ${iterations}`,
        );

        const newHistoryEntry: HistoryEntry = {
          timestamp: nextRunTime.toISOString(),
          amount: tempRecord.amount,
        };

        // Add to history
        tempRecord.history = [newHistoryEntry, ...tempRecord.history];

        // Update totalAccumulated
        const numericAmount =
          parseFloat(tempRecord.amount.replace(/[^0-9.]/g, "")) || 0;
        tempRecord.totalAccumulated += numericAmount;
      } else {
        console.log(
          `[Reconciler] ⏭️ Skipping cycle ${iterations} as requested by user`,
        );
        tempRecord.skipNext = false; // Reset skip flag after one skip
      }

      // Calculate the next date for the next iteration of the loop
      nextRunTime = getNextDate(nextRunTime, tempRecord.frequency);
    }

    // Update the final timestamps for display and raw logic
    tempRecord.nextRunRaw = nextRunTime.toISOString();
    tempRecord.nextRun = formatDisplayDate(nextRunTime);

    console.log(
      `[Reconciler] ✨ "${record.title}" updated. Next run: ${tempRecord.nextRun}`,
    );
    return tempRecord;
  });

  console.log(`[Reconciler] 🏁 Reconciliation complete.`);
  return updatedRecords;
};
