import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { File, Directory, Paths } from "expo-file-system";
import {
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";

const voiceNotesDir = new Directory(Paths.document, "voice-notes");

const formatDuration = (seconds) => {
  const total = Math.max(0, Math.round(seconds || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const saveRecordingToDisk = (tempUri, previousUri) => {
  if (!voiceNotesDir.exists) {
    voiceNotesDir.create({ intermediates: true, idempotent: true });
  }
  const source = new File(tempUri);
  const dest = new File(voiceNotesDir, `voice-${Date.now()}${source.extension || ".m4a"}`);
  source.move(dest);

  if (previousUri) {
    try {
      const old = new File(previousUri);
      if (old.exists) old.delete();
    } catch (_) {}
  }

  return dest.uri;
};

export const deleteVoiceRecording = (uri) => {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (_) {}
};

export default function VoiceRecorder({ uri, onChange, theme }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(uri || null);
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    // allowsRecording forces iOS into the .playAndRecord audio session category, which
    // routes output to the quiet earpiece instead of the main speaker. Keep it off except
    // for the brief window we're actually recording, so playback stays at full volume.
    setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  }, []);

  const handleRecordPress = async () => {
    if (recorderState.isRecording) {
      try {
        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        if (recorder.uri) {
          const permanentUri = saveRecordingToDisk(recorder.uri, uri);
          onChange?.(permanentUri);
        }
      } catch (error) {
        Alert.alert("Couldn't save recording", error.message || "Please try again.");
      }
      return;
    }

    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      Alert.alert("Microphone permission needed", "Enable microphone access to record a voice note.");
      return;
    }

    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      Alert.alert("Couldn't start recording", error.message || "Please try again.");
    }
  };

  const handleDelete = () => {
    deleteVoiceRecording(uri);
    onChange?.(null);
  };

  const togglePlayback = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      if (playerStatus.didJustFinish) player.seekTo(0);
      player.play();
    }
  };

  return (
    <View style={styles.wrapper}>
      {recorderState.isRecording ? (
        <View style={[styles.row, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <View style={styles.recordingDot} />
          <Text style={[styles.durationText, { color: theme.text }]}>
            {formatDuration(recorderState.durationMillis / 1000)}
          </Text>
          <TouchableOpacity style={styles.stopButton} onPress={handleRecordPress}>
            <Ionicons name="stop" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : uri ? (
        <View style={[styles.row, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TouchableOpacity onPress={togglePlayback} hitSlop={8}>
            <Ionicons
              name={playerStatus.playing ? "pause-circle" : "play-circle"}
              size={32}
              color={theme.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.durationText, { color: theme.text }]}>
            {formatDuration(playerStatus.currentTime)} / {formatDuration(playerStatus.duration)}
          </Text>
          <TouchableOpacity onPress={handleRecordPress} hitSlop={8}>
            <Ionicons name="mic-outline" size={20} color={theme.textSub} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={20} color="#e53935" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.recordButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
          onPress={handleRecordPress}
          activeOpacity={0.7}
        >
          <Ionicons name="mic-outline" size={20} color={theme.textSub} />
          <Text style={[styles.recordButtonText, { color: theme.textSub }]}>Record a voice note</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  durationText: { flex: 1, fontSize: 15, fontWeight: "500" },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e53935",
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e53935",
    alignItems: "center",
    justifyContent: "center",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
  },
  recordButtonText: { fontSize: 15, fontWeight: "500" },
});
