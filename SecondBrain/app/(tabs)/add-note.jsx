import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useNotes } from "../../context/NotesContext";
import { useTheme } from "../../context/ThemeContext";
import TagsInput from "../../components/TagsInput";

export default function AddNote() {
  const { addNote } = useNotes();
  const { theme } = useTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const styles = makeStyles(theme);

  const handleSubmit = () => {
    if (!title.trim() && !content.trim()) return;
    addNote({ title: title.trim(), content: content.trim(), tags });
    setTitle("");
    setContent("");
    setTags([]);
    router.push("/");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>New Note</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Give your note a title..."
          placeholderTextColor={theme.placeholder}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write your note here..."
          placeholderTextColor={theme.placeholder}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Tags</Text>
        <TagsInput tags={tags} onChange={setTags} />

        <TouchableOpacity
          style={[styles.button, !title.trim() && !content.trim() && styles.buttonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Save Note</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    inner: { padding: 24, paddingTop: 32, paddingBottom: 120 },
    heading: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 28,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textSub,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.inputBg,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: theme.text,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textArea: { height: 180 },
    button: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      padding: 16,
      alignItems: "center",
      marginTop: 16,
    },
    buttonDisabled: { opacity: 0.4 },
    buttonText: { color: theme.primaryText, fontSize: 16, fontWeight: "600" },
  });
