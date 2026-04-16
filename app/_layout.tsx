import { Stack } from "expo-router";
import { Colors } from "../src/constants/Colors";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
        // FIX 1: Use an empty string to hide the previous screen title ("Records")
        headerBackTitle: "",
        headerTintColor: Colors.onSurface,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "800",
          color: Colors.onSurface,
        },
      }}
    >
      {/* Main Dashboard */}
      <Stack.Screen
        name="index"
        options={{
          title: "Records",
        }}
      />

      {/* FIX 2: Define modal behavior directly on the screens 
          if Stack.Group is throwing a type error in your environment */}
      <Stack.Screen
        name="(modals)/new-record"
        options={{
          presentation: "modal",
          title: "New Record",
          headerTitleAlign: "center",
        }}
      />

      <Stack.Screen
        name="(modals)/settings"
        options={{
          presentation: "modal",
          title: "Settings",
          headerTitleAlign: "center",
        }}
      />

      {/* Record Details Screen */}
      <Stack.Screen
        name="details/[id]"
        options={{
          title: "Record Detail",
          headerTitleAlign: "center",
          headerBackTitle: "Back", // Show "Back" on the details screen for clarity
        }}
      />
    </Stack>
  );
}
