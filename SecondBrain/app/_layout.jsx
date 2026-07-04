import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { NotesProvider } from "../context/NotesContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import {
  setupNotificationChannel,
  requestNotificationPermissions,
} from "../utils/notifications";

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

async function initDb(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      createdAt INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  try { await db.execAsync("ALTER TABLE notes ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'"); } catch (_) {}
  try { await db.execAsync("ALTER TABLE notes ADD COLUMN reminder INTEGER DEFAULT NULL"); } catch (_) {}
  try { await db.execAsync("ALTER TABLE notes ADD COLUMN notificationId TEXT DEFAULT NULL"); } catch (_) {}
  try { await db.execAsync("ALTER TABLE notes ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0"); } catch (_) {}
  try { await db.execAsync("ALTER TABLE notes ADD COLUMN mode TEXT NOT NULL DEFAULT 'text'"); } catch (_) {}
  try { await db.execAsync("ALTER TABLE notes ADD COLUMN drawing TEXT DEFAULT NULL"); } catch (_) {}
  try { await db.execAsync("ALTER TABLE notes ADD COLUMN audioUri TEXT DEFAULT NULL"); } catch (_) {}
}

export default function RootLayout() {
  useEffect(() => {
    setupNotificationChannel();
    requestNotificationPermissions();

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const noteId = response.notification.request.content.data?.noteId;
      if (noteId) router.push(`/note/${noteId}`);
    });

    return () => sub.remove();
  }, []);

  return (
    <SQLiteProvider databaseName="notes.db" onInit={initDb}>
      <NotesProvider>
        <ThemeProvider>
          <ThemedStatusBar />
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </NotesProvider>
    </SQLiteProvider>
  );
}
