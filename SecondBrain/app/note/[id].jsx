import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotes } from "../../context/NotesContext";
import { useTheme } from "../../context/ThemeContext";
import TagsInput from "../../components/TagsInput";
import ReminderPicker from "../../components/ReminderPicker";
import DrawingCanvas from "../../components/DrawingCanvas";
import VoiceRecorder from "../../components/VoiceRecorder";
import KeyboardDismissOverlay from "../../components/KeyboardDismissOverlay";
import { scheduleReminder, cancelReminder } from "../../utils/notifications";

const MODES = [
  { key: "text", label: "Written" },
  { key: "drawing", label: "Drawing" },
  { key: "voice", label: "Voice" },
];

export default function NoteDetail() {
  const { id } = useLocalSearchParams();
  const { notes, updateNote, setReminder, togglePin, deleteNote } = useNotes();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const note = notes.find((n) => String(n.id) === String(id));

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [tags, setTags] = useState(note?.tags ?? []);
  const [mode, setMode] = useState(note?.mode ?? "text");
  const [drawing, setDrawing] = useState(note?.drawing ?? []);
  const [audioUri, setAudioUri] = useState(note?.audioUri ?? null);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSetReminder = async (date) => {
    try {
      const notificationId = await scheduleReminder({
        noteId: id,
        noteTitle: titleRef.current,
        date,
      });
      await cancelReminder(note.notificationId);
      await setReminder({ id, reminder: date.getTime(), notificationId });
    } catch (error) {
      Alert.alert("Couldn't set reminder", error.message || "Please try again.");
    }
  };

  const handleCancelReminder = async () => {
    try {
      await cancelReminder(note.notificationId);
      await setReminder({ id, reminder: null, notificationId: null });
    } catch (error) {
      Alert.alert("Couldn't cancel reminder", error.message || "Please try again.");
    }
  };

  const titleRef = useRef(note?.title ?? "");
  const contentRef = useRef(note?.content ?? "");
  const tagsRef = useRef(note?.tags ?? []);
  const modeRef = useRef(note?.mode ?? "text");
  const drawingRef = useRef(note?.drawing ?? []);
  const audioUriRef = useRef(note?.audioUri ?? null);
  const isDeletingRef = useRef(false);

  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { tagsRef.current = tags; }, [tags]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { drawingRef.current = drawing; }, [drawing]);
  useEffect(() => { audioUriRef.current = audioUri; }, [audioUri]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      if (isDeletingRef.current) return;
      updateNote({
        id,
        title: titleRef.current,
        content: contentRef.current,
        tags: tagsRef.current,
        mode: modeRef.current,
        drawing: drawingRef.current,
        audioUri: audioUriRef.current,
      });
    });
    return unsubscribe;
  }, [navigation]);

  const handleBack = () => router.back();

  const handleTogglePin = () => {
    setMenuVisible(false);
    togglePin(id);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      "Delete note",
      "This note will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            isDeletingRef.current = true;
            await deleteNote(id);
            router.back();
          },
        },
      ]
    );
  };

  const styles = makeStyles(theme);

  if (!note) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.textSub }}>Note not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <View>
          <TouchableOpacity
            onPress={() => setMenuVisible((v) => !v)}
            style={styles.headerBtn}
            hitSlop={8}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={theme.text} />
          </TouchableOpacity>

          {menuVisible && (
            <View style={styles.menu}>
              <TouchableOpacity onPress={handleTogglePin} style={styles.menuItem}>
                <Ionicons
                  name={note.pinned ? "pin" : "pin-outline"}
                  size={16}
                  color={theme.text}
                />
                <Text style={[styles.menuItemText, { color: theme.text }]}>
                  {note.pinned ? "Unpin note" : "Pin note"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.menuItem}>
                <Ionicons name="trash-outline" size={16} color="#e53935" />
                <Text style={styles.menuItemText}>Delete note</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {menuVisible && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => setMenuVisible(false)}
          activeOpacity={1}
        />
      )}

      <View style={styles.subHeader}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <View style={[styles.modeSwitch, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.modeButton, mode === m.key && { backgroundColor: theme.primary }]}
              onPress={() => setMode(m.key)}
            >
              <Text style={[styles.modeButtonText, { color: mode === m.key ? theme.primaryText : theme.textSub }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {mode === "text" && (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Start writing..."
            placeholderTextColor={theme.placeholder}
            multiline
            textAlignVertical="top"
          />

          <TagsInput tags={tags} onChange={setTags} />

          <Text style={styles.sectionLabel}>Reminder</Text>
          <ReminderPicker
            reminder={note.reminder}
            onSet={handleSetReminder}
            onCancel={handleCancelReminder}
          />
        </ScrollView>
      )}

      {mode === "drawing" && (
        <View style={styles.drawingBody}>
          <View style={styles.canvasWrapper}>
            <DrawingCanvas strokes={drawing} onChange={setDrawing} theme={theme} />
            <KeyboardDismissOverlay />
          </View>

          <TagsInput tags={tags} onChange={setTags} />

          <Text style={styles.sectionLabel}>Reminder</Text>
          <ReminderPicker
            reminder={note.reminder}
            onSet={handleSetReminder}
            onCancel={handleCancelReminder}
          />
        </View>
      )}

      {mode === "voice" && (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}>
          <VoiceRecorder uri={audioUri} onChange={setAudioUri} theme={theme} />

          <TagsInput tags={tags} onChange={setTags} />

          <Text style={styles.sectionLabel}>Reminder</Text>
          <ReminderPicker
            reminder={note.reminder}
            onSet={handleSetReminder}
            onCancel={handleCancelReminder}
          />
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: theme.bg,
    },
    headerBtn: { padding: 6 },
    menu: {
      position: "absolute",
      top: 38,
      right: 0,
      backgroundColor: theme.surface,
      borderRadius: 10,
      paddingVertical: 4,
      minWidth: 160,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
      zIndex: 100,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    menuItemText: { fontSize: 15, color: "#e53935" },
    subHeader: { paddingHorizontal: 24 },
    body: { paddingHorizontal: 24, paddingBottom: 60 },
    drawingBody: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
    canvasWrapper: { flex: 1 },
    modeSwitch: {
      flexDirection: "row",
      borderRadius: 12,
      borderWidth: 1,
      padding: 4,
      marginBottom: 16,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 9,
      alignItems: "center",
    },
    modeButtonText: { fontSize: 14, fontWeight: "600" },
    titleInput: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 16,
      lineHeight: 34,
    },
    contentInput: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 24,
      minHeight: 300,
      marginBottom: 24,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textSub,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginTop: 24,
      marginBottom: 8,
    },
  });
