import { useEffect, useState } from "react";
import { View, StyleSheet, Keyboard } from "react-native";

export default function KeyboardDismissOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!visible) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      onStartShouldSetResponder={() => true}
      onResponderGrant={() => Keyboard.dismiss()}
    />
  );
}
