import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
}

export const SettingItem = ({
  icon,
  label,
  value,
  onPress,
  color = Colors.primary,
}: Props) => (
  <TouchableOpacity
    style={styles.container}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.7}
  >
    <View style={styles.left}>
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
    <View style={styles.right}>
      {value ? <Text style={styles.valueText}>{value}</Text> : null}
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.surface,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  label: { fontSize: 15, fontWeight: "500", color: Colors.onSurface },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  valueText: { fontSize: 13, color: Colors.onSurfaceVariant },
});
