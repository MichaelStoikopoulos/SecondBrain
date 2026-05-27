import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useNotes } from "../context/NotesContext";

export default function Index() {
  const { notes } = useNotes();

  if (notes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>No notes yet</Text>
        <Text style={styles.emptySubtitle}>Tap the + button to create your first note</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Notes</Text>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            {item.title ? <Text style={styles.cardTitle}>{item.title}</Text> : null}
            {item.content ? (
              <Text style={styles.cardContent} numberOfLines={3}>
                {item.content}
              </Text>
            ) : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a2e",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 10,
  },
  cardDate: {
    fontSize: 12,
    color: "#aaa",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
