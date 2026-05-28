import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function TagsInput({ tags = [], onChange }) {
  const { theme } = useTheme();
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim().toLowerCase().replace(/,/g, "");
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput("");
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <View>
      {tags.length > 0 && (
        <View style={styles.chips}>
          {tags.map((tag) => (
            <View key={tag} style={[styles.chip, { backgroundColor: theme.tagBg }]}>
              <Text style={[styles.chipText, { color: theme.tagText }]}>#{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)} hitSlop={6}>
                <Text style={[styles.chipRemove, { color: theme.tagText }]}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
        placeholder="Add a tag and press Enter..."
        placeholderTextColor={theme.placeholder}
        value={input}
        onChangeText={(text) => {
          if (text.endsWith(",")) {
            addTag();
          } else {
            setInput(text);
          }
        }}
        onSubmitEditing={addTag}
        returnKeyType="done"
        blurOnSubmit={false}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 8,
    gap: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  chipRemove: {
    fontSize: 16,
    lineHeight: 18,
    opacity: 0.7,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 20,
  },
});
