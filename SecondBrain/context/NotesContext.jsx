import { createContext, useContext, useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { deleteVoiceRecording } from "../components/VoiceRecorder";

const NotesContext = createContext();

const parseNote = (row) => ({
  ...row,
  tags: JSON.parse(row.tags || "[]"),
  reminder: row.reminder ?? null,
  notificationId: row.notificationId ?? null,
  pinned: !!row.pinned,
  mode: row.mode || "text",
  drawing: row.drawing ? JSON.parse(row.drawing) : [],
  audioUri: row.audioUri ?? null,
});

export function NotesProvider({ children }) {
  const db = useSQLiteContext();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const rows = await db.getAllAsync(
      "SELECT * FROM notes ORDER BY pinned DESC, createdAt DESC"
    );
    setNotes(rows.map(parseNote));
  };

  const addNote = async ({ title, content, tags = [], mode = "text", drawing = [], audioUri = null }) => {
    await db.runAsync(
      "INSERT INTO notes (title, content, tags, createdAt, mode, drawing, audioUri) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, content, JSON.stringify(tags), Date.now(), mode, JSON.stringify(drawing), audioUri]
    );
    await loadNotes();
  };

  const updateNote = async ({ id, title, content, tags = [], mode = "text", drawing = [], audioUri = null }) => {
    await db.runAsync(
      "UPDATE notes SET title = ?, content = ?, tags = ?, mode = ?, drawing = ?, audioUri = ? WHERE id = ?",
      [title, content, JSON.stringify(tags), mode, JSON.stringify(drawing), audioUri, Number(id)]
    );
    setNotes((prev) =>
      prev.map((n) => (n.id === Number(id) ? { ...n, title, content, tags, mode, drawing, audioUri } : n))
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

  const togglePin = async (id) => {
    const note = notes.find((n) => n.id === Number(id));
    const pinned = note?.pinned ? 0 : 1;
    await db.runAsync("UPDATE notes SET pinned = ? WHERE id = ?", [pinned, Number(id)]);
    await loadNotes();
  };

  const deleteNote = async (id) => {
    const note = notes.find((n) => n.id === Number(id));
    await db.runAsync("DELETE FROM notes WHERE id = ?", [Number(id)]);
    setNotes((prev) => prev.filter((n) => n.id !== Number(id)));
    if (note?.audioUri) deleteVoiceRecording(note.audioUri);
  };

  return (
    <NotesContext.Provider value={{ notes, loadNotes, addNote, updateNote, setReminder, togglePin, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}
