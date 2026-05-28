import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNotes } from "../../context/NotesContext";
import { useTheme } from "../../context/ThemeContext";

export default function Index() {
  const { notes, loadNotes } = useNotes();
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const styles = makeStyles(theme);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const filtered = query.trim()
    ? notes.filter((n) => {
        const q = query.toLowerCase();
        return (
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q) ||
          n.tags?.some((tag) => tag.toLowerCase().includes(q))
        );
      })
    : notes;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Notes</Text>

      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={theme.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={theme.placeholder}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          {notes.length === 0 ? (
            <>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptySubtitle}>Tap the + button to create your first note</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptySubtitle}>No notes match "{query}"</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/note/${item.id}`)}
            >
              {item.title ? <Text style={styles.cardTitle}>{item.title}</Text> : null}
              {item.content ? (
                <Text style={styles.cardContent} numberOfLines={3}>
                  {item.content}
                </Text>
              ) : null}
              {item.tags?.length > 0 && (
                <View style={styles.cardTags}>
                  {item.tags.map((tag) => (
                    <View key={tag} style={styles.cardTag}>
                      <Text style={styles.cardTagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    heading: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 12,
    },
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginHorizontal: 24,
      marginBottom: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 8,
    },
    searchIcon: { flexShrink: 0 },
    searchInput: { flex: 1, fontSize: 15, color: theme.text, padding: 0 },
    list: { paddingHorizontal: 24, paddingBottom: 120, gap: 12 },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardTitle: { fontSize: 16, fontWeight: "600", color: theme.text, marginBottom: 6 },
    cardContent: { fontSize: 14, color: theme.textSub, lineHeight: 20, marginBottom: 10 },
    cardTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
    cardTag: {
      backgroundColor: theme.tagBg,
      borderRadius: 20,
      paddingVertical: 2,
      paddingHorizontal: 8,
    },
    cardTagText: { color: theme.tagText, fontSize: 11, fontWeight: "500" },
    cardDate: { fontSize: 12, color: theme.textMuted },
    empty: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 80,
      gap: 8,
    },
    emptyIcon: { fontSize: 48, marginBottom: 8 },
    emptyTitle: { fontSize: 20, fontWeight: "600", color: theme.text },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textSub,
      textAlign: "center",
      paddingHorizontal: 40,
    },
  });
