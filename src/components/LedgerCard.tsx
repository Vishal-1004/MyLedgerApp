import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { LedgerRecord } from "../store/useLedgerStore";

interface Props {
  record: LedgerRecord;
  onPress: () => void;
}

export const LedgerCard = ({ record, onPress }: Props) => {
  const {
    title,
    description,
    amount,
    frequency,
    skipNext,
    totalAccumulated,
    isRecurring,
  } = record;

  // Format the accumulated amount to Indian numbering system (en-IN)
  const formattedAccumulated = totalAccumulated.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <TouchableOpacity
      style={[styles.card, isRecurring && skipNext && styles.skippedCard]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Accent tab turns grey if the recurring record is paused */}
      <View
        style={[styles.accentTab, isRecurring && skipNext && styles.skippedTab]}
      />

      <View style={styles.content}>
        <View style={styles.leftCol}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {/* Show PAUSED badge only for recurring items that are skipped */}
            {isRecurring && skipNext && (
              <Text style={styles.skipBadge}>PAUSED</Text>
            )}
          </View>

          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>

          {totalAccumulated > 0 && (
            <Text style={styles.accumulatedText} numberOfLines={1}>
              Accumulated: ₹ {formattedAccumulated}
            </Text>
          )}
        </View>

        <View style={styles.rightCol}>
          <Text
            style={styles.amount}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {amount}
          </Text>

          {/* If the record is not recurring, we show "ONE-TIME" 
              instead of "MONTHLY", "DAILY", etc. 
          */}
          <Text style={styles.frequency}>
            {isRecurring ? frequency.toUpperCase() : "ONE-TIME"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  skippedCard: {
    opacity: 0.6,
  },
  accentTab: {
    width: 4,
    backgroundColor: Colors.primaryContainer,
  },
  skippedTab: {
    backgroundColor: Colors.outline,
  },
  content: {
    flex: 1,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  leftCol: {
    flex: 1,
    marginRight: 8,
  },
  rightCol: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 80,
    flexShrink: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.onSurface,
    fontFamily: "PlusJakartaSans",
    flexShrink: 1,
  },
  skipBadge: {
    fontSize: 9,
    fontWeight: "800",
    backgroundColor: Colors.background,
    color: Colors.onSurfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  description: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  accumulatedText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 6,
  },
  amount: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
    textAlign: "right",
  },
  frequency: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.outline,
    marginTop: 4,
    letterSpacing: 1,
    textAlign: "right",
  },
});
