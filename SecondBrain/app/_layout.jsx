import { Tabs } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SQLiteProvider } from "expo-sqlite";
import { NotesProvider } from "../context/NotesContext";

async function initDb(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      createdAt INTEGER NOT NULL
    );
  `);
}

const TAB_ICONS = {
  index:    ["list",        "list-outline"],
  "add-note": ["add-circle", "add-circle-outline"],
  settings: ["settings",   "settings-outline"],
};

function CustomTabBar({ state, navigation }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const [activeIcon, inactiveIcon] = TAB_ICONS[route.name] ?? ["circle", "circle-outline"];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tab, isFocused && styles.activeTab]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? activeIcon : inactiveIcon}
                size={24}
                color={isFocused ? "#fff" : "rgba(255,255,255,0.5)"}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  tab: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
});

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="notes.db" onInit={initDb}>
      <NotesProvider>
        <Tabs
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="add-note" />
          <Tabs.Screen name="settings" />
        </Tabs>
      </NotesProvider>
    </SQLiteProvider>
  );
}
