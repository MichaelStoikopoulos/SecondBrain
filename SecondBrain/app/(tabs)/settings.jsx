import { View, Text, Switch, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function Settings() {
  const { isDark, toggleTheme, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(theme);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>Dark mode</Text>
            <Text style={styles.rowSub}>Switch to a darker appearance</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#e0e0e0", true: theme.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </View>
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    heading: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 24,
    },
    section: {
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.border,
      marginHorizontal: 16,
      borderRadius: 14,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowLeft: {
      flex: 1,
      gap: 2,
    },
    rowTitle: {
      fontSize: 16,
      color: theme.text,
      fontWeight: "500",
    },
    rowSub: {
      fontSize: 13,
      color: theme.textSub,
    },
  });
