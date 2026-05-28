import { createContext, useContext, useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { lightTheme, darkTheme } from "../constants/theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const db = useSQLiteContext();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const row = await db.getFirstAsync(
      "SELECT value FROM settings WHERE key = 'theme'"
    );
    if (row) setIsDark(row.value === "dark");
  };

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await db.runAsync(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', ?)",
      [next ? "dark" : "light"]
    );
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme: isDark ? darkTheme : lightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
