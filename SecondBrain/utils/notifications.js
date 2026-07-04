import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const setupNotificationChannel = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Note Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const scheduleReminder = async ({ noteId, noteTitle, date }) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Reminder date is invalid.");
  }
  if (date.getTime() <= Date.now()) {
    throw new Error("Reminder date must be in the future.");
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      throw new Error("Notification permission was not granted.");
    }
  }

  // Idempotent: guards against the channel not being ready yet (e.g. right after a fresh install).
  await setupNotificationChannel();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "📝 SecondBrain Reminder",
      body: noteTitle?.trim() || "You have a note reminder",
      data: { noteId },
      ...(Platform.OS === "android" && { channelId: "reminders" }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
  return id;
};

export const cancelReminder = async (notificationId) => {
  if (notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (_) {}
  }
};
