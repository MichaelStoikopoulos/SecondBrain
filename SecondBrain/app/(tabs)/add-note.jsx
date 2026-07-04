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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotes } from "../../context/NotesContext";
import { useTheme } from "../../context/ThemeContext";
import TagsInput from "../../components/TagsInput";
import DrawingCanvas from "../../components/DrawingCanvas";
import VoiceRecorder from "../../components/VoiceRecorder";
import KeyboardDismissOverlay from "../../components/KeyboardDismissOverlay";

const MODES = [
  { key: "text", label: "Written" },
  { key: "drawing", label: "Drawing" },
  { key: "voice", label: "Voice" },
];

export default function AddNote() {
  const { addNote } = useNotes();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [mode, setMode] = useState("text");
  const [drawing, setDrawing] = useState([]);
  const [audioUri, setAudioUri] = useState(null);
  const styles = makeStyles(theme);

  const isEmpty =
    mode === "text"
      ? !title.trim() && !content.trim()
      : mode === "drawing"
        ? drawing.length === 0 && !title.trim()
        : !audioUri && !title.trim();

  const handleSubmit = () => {
    if (isEmpty) return;
    addNote({ title: title.trim(), content: content.trim(), tags, mode, drawing, audioUri });
    setTitle("");
    setContent("");
    setTags([]);
    setDrawing([]);
    setAudioUri(null);
    setMode("text");
    router.push("/");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>New Note</Text>

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

        <TextInput
          style={styles.input}
          placeholder="Give your note a title..."
          placeholderTextColor={theme.placeholder}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {mode === "text" && (
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}>
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
            style={[styles.button, isEmpty && styles.buttonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Save Note</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {mode === "drawing" && (
        <View style={styles.drawingArea}>
          <View style={styles.canvasWrapper}>
            <DrawingCanvas strokes={drawing} onChange={setDrawing} theme={theme} />
            <KeyboardDismissOverlay />
          </View>

          <TagsInput tags={tags} onChange={setTags} />

          <TouchableOpacity
            style={[styles.button, isEmpty && styles.buttonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Save Note</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === "voice" && (
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}>
          <VoiceRecorder uri={audioUri} onChange={setAudioUri} theme={theme} />

          <Text style={styles.label}>Tags</Text>
          <TagsInput tags={tags} onChange={setTags} />

          <TouchableOpacity
            style={[styles.button, isEmpty && styles.buttonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Save Note</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    header: { paddingHorizontal: 24, paddingTop: 32 },
    inner: { paddingHorizontal: 24, paddingBottom: 120 },
    drawingArea: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
    canvasWrapper: { flex: 1 },
    heading: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 20,
    },
    modeSwitch: {
      flexDirection: "row",
      borderRadius: 12,
      borderWidth: 1,
      padding: 4,
      marginBottom: 20,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 9,
      alignItems: "center",
    },
    modeButtonText: { fontSize: 14, fontWeight: "600" },
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
