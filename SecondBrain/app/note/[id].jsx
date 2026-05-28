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
import { useNotes } from "../../context/NotesContext";
import { useTheme } from "../../context/ThemeContext";
import TagsInput from "../../components/TagsInput";
import ReminderPicker from "../../components/ReminderPicker";
import { scheduleReminder, cancelReminder } from "../../utils/notifications";

export default function NoteDetail() {
  const { id } = useLocalSearchParams();
  const { notes, updateNote, setReminder, deleteNote } = useNotes();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const note = notes.find((n) => String(n.id) === String(id));

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [tags, setTags] = useState(note?.tags ?? []);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSetReminder = async (date) => {
    await cancelReminder(note.notificationId);
    const notificationId = await scheduleReminder({
      noteId: id,
      noteTitle: titleRef.current,
      date,
    });
    await setReminder({ id, reminder: date.getTime(), notificationId });
  };

  const handleCancelReminder = async () => {
    await cancelReminder(note.notificationId);
    await setReminder({ id, reminder: null, notificationId: null });
  };

  const titleRef = useRef(note?.title ?? "");
  const contentRef = useRef(note?.content ?? "");
  const tagsRef = useRef(note?.tags ?? []);
  const isDeletingRef = useRef(false);

  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { tagsRef.current = tags; }, [tags]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async (e) => {
      if (isDeletingRef.current) return;
      e.preventDefault();
      await updateNote({ id, title: titleRef.current, content: contentRef.current, tags: tagsRef.current });
      navigation.dispatch(e.data.action);
    });
    return unsubscribe;
  }, [navigation]);

  const handleBack = () => router.back();

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
            router.back();
            await deleteNote(id);
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
      <View style={styles.header}>
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

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={theme.placeholder}
          multiline
        />
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
      paddingTop: 56,
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
    body: { paddingHorizontal: 24, paddingBottom: 60 },
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
