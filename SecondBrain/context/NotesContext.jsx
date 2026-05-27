import { createContext, useContext, useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";

const NotesContext = createContext();

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
    setNotes(rows);
  };

  const addNote = async ({ title, content }) => {
    await db.runAsync(
      "INSERT INTO notes (title, content, createdAt) VALUES (?, ?, ?)",
      [title, content, Date.now()]
    );
    await loadNotes();
  };

  return (
    <NotesContext.Provider value={{ notes, addNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}
