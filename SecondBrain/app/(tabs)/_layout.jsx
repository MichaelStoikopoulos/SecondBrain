import { Tabs } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const TAB_ICONS = {
  index:      ["list",       "list-outline"],
  "add-note": ["add-circle", "add-circle-outline"],
  settings:   ["settings",   "settings-outline"],
};

function CustomTabBar({ state, navigation }) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.pill, { backgroundColor: theme.pillBg }]}>
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
              style={[
                styles.tab,
                isFocused && { backgroundColor: theme.pillActive },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? activeIcon : inactiveIcon}
                size={24}
                color={isFocused ? theme.pillIcon : theme.pillIconInactive}
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
});

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="add-note" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
