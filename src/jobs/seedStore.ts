import { LedgerRecord } from "../store/useLedgerStore";

export const seedDefaultRecords = (): LedgerRecord[] => {
  const now = new Date();

  // Create a date in the past (2 days ago) to test catch-up logic
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(now.getDate() - 2);

  // Create a date in the past (2 months ago) to test monthly catch-up
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);

  const defaultRecords: LedgerRecord[] = [
    {
      id: "seed-1",
      title: "Netflix Subscription",
      description: "Standard monthly plan for streaming.",
      amount: "₹ 499.00",
      frequency: "Monthly",
      // Set to 2 months ago: Reconciler should add 2 history entries automatically
      nextRunRaw: twoMonthsAgo.toISOString(),
      nextRun: "Pending Reconciliation...",
      totalAccumulated: 0,
      skipNext: false,
      history: [],
      createdAt: now.toISOString(),
    },
    {
      id: "seed-2",
      title: "Daily Coffee",
      description: "Quick caffeine fix at the local cafe.",
      amount: "₹ 150.00",
      frequency: "Daily",
      // Set to 2 days ago: Reconciler should add 2 entries
      nextRunRaw: twoDaysAgo.toISOString(),
      nextRun: "Pending Reconciliation...",
      totalAccumulated: 0,
      skipNext: false,
      history: [],
      createdAt: now.toISOString(),
    },
    {
      id: "seed-3",
      title: "Gym Membership",
      description: "Yearly fitness club renewal.",
      amount: "₹ 12,000.00",
      frequency: "Yearly",
      // Set to future: Should stay as is
      nextRunRaw: new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate(),
      ).toISOString(),
      nextRun: "Next Year",
      totalAccumulated: 12000,
      skipNext: false,
      history: [{ timestamp: now.toISOString(), amount: "₹ 12,000.00" }],
      createdAt: now.toISOString(),
    },
  ];

  console.log("[Seeder] 🌱 Generated default test records.");
  return defaultRecords;
};
