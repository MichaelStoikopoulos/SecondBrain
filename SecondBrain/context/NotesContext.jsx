import { createContext, useContext, useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";

const NotesContext = createContext();

const parseNote = (row) => ({
  ...row,
  tags: JSON.parse(row.tags || "[]"),
  reminder: row.reminder ?? null,
  notificationId: row.notificationId ?? null,
});

export function NotesProvider({ children }) {
  const db = useSQLiteContext();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const rows = await db.getAllAsync(
      "SELECT * FROM notes ORDER BY createdAt DESC"
    );
    setNotes(rows.map(parseNote));
  };

  const addNote = async ({ title, content, tags = [] }) => {
    await db.runAsync(
      "INSERT INTO notes (title, content, tags, createdAt) VALUES (?, ?, ?, ?)",
      [title, content, JSON.stringify(tags), Date.now()]
    );
    await loadNotes();
  };

  const updateNote = async ({ id, title, content, tags = [] }) => {
    await db.runAsync(
      "UPDATE notes SET title = ?, content = ?, tags = ? WHERE id = ?",
      [title, content, JSON.stringify(tags), Number(id)]
    );
    setNotes((prev) =>
      prev.map((n) => (n.id === Number(id) ? { ...n, title, content, tags } : n))
    );
  };

  const setReminder = async ({ id, reminder, notificationId }) => {
    await db.runAsync(
      "UPDATE notes SET reminder = ?, notificationId = ? WHERE id = ?",
      [reminder, notificationId, Number(id)]
    );
    setNotes((prev) =>
      prev.map((n) =>
        n.id === Number(id) ? { ...n, reminder, notificationId } : n
      )
    );
  };

  const deleteNote = async (id) => {
    await db.runAsync("DELETE FROM notes WHERE id = ?", [Number(id)]);
    setNotes((prev) => prev.filter((n) => n.id !== Number(id)));
  };

  return (
    <NotesContext.Provider value={{ notes, loadNotes, addNote, updateNote, setReminder, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}
