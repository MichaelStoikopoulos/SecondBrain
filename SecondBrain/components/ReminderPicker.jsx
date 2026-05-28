import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function ReminderPicker({ reminder, onSet, onCancel }) {
  const { theme } = useTheme();
  const initialDate = () =>
    reminder ? new Date(reminder) : new Date(Date.now() + 60 * 60 * 1000);

  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(initialDate);
  const [androidStep, setAndroidStep] = useState("date");

  const handlePress = () => {
    setTempDate(initialDate());
    setAndroidStep("date");
    setShowPicker(true);
  };

  const handleAndroidChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }
    if (androidStep === "date") {
      setTempDate(selectedDate);
      setAndroidStep("time");
    } else {
      setShowPicker(false);
      onSet(selectedDate);
    }
  };

  const handleIOSChange = (_, selectedDate) => {
    if (selectedDate) setTempDate(selectedDate);
  };

  const handleIOSConfirm = () => {
    setShowPicker(false);
    onSet(tempDate);
  };

  if (reminder) {
    return (
      <View style={[styles.reminderSet, { backgroundColor: theme.reminderBg, borderColor: theme.reminderBorder }]}>
        <Ionicons name="alarm" size={16} color={theme.text} />
        <Text style={[styles.reminderText, { color: theme.text }]}>
          {new Date(reminder).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <TouchableOpacity onPress={handlePress} hitSlop={8}>
          <Ionicons name="pencil-outline" size={15} color={theme.textSub} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        {Platform.OS === "android" && showPicker && (
          <DateTimePicker
            value={tempDate}
            mode={androidStep}
            display="default"
            onChange={handleAndroidChange}
            minimumDate={new Date()}
          />
        )}
        {Platform.OS === "ios" && (
          <IOSPickerModal
            visible={showPicker}
            value={tempDate}
            onChange={handleIOSChange}
            onConfirm={handleIOSConfirm}
            onCancel={() => setShowPicker(false)}
            theme={theme}
          />
        )}
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons name="alarm-outline" size={18} color={theme.textSub} />
        <Text style={[styles.addButtonText, { color: theme.textSub }]}>Add reminder</Text>
      </TouchableOpacity>

      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={tempDate}
          mode={androidStep}
          display="default"
          onChange={handleAndroidChange}
          minimumDate={new Date()}
        />
      )}
      {Platform.OS === "ios" && (
        <IOSPickerModal
          visible={showPicker}
          value={tempDate}
          onChange={handleIOSChange}
          onConfirm={handleIOSConfirm}
          onCancel={() => setShowPicker(false)}
          theme={theme}
        />
      )}
    </View>
  );
}

function IOSPickerModal({ visible, value, onChange, onConfirm, onCancel, theme }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <DateTimePicker
            value={value}
            mode="datetime"
            display="spinner"
            onChange={onChange}
            minimumDate={new Date()}
            style={styles.iosPicker}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onCancel} style={styles.modalBtn}>
              <Text style={[styles.cancelText, { color: theme.textSub }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.modalBtn}>
              <Text style={[styles.confirmText, { color: theme.text }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  addButtonText: { fontSize: 15 },
  reminderSet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  reminderText: { flex: 1, fontSize: 14, fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  iosPicker: { height: 220 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  modalBtn: { padding: 8 },
  cancelText: { fontSize: 16 },
  confirmText: { fontSize: 16, fontWeight: "600" },
});
