import { useRef, useState } from "react";
import { View, StyleSheet, PanResponder, TouchableOpacity, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

const COLORS = ["#1a1a2e", "#e53935", "#1e88e5", "#43a047", "#fb8c00"];

const pathFromPoints = (points) =>
  points.length
    ? points.reduce((acc, [x, y], i) => `${acc}${i === 0 ? "M" : "L"}${x},${y} `, "")
    : "";

export default function DrawingCanvas({ strokes = [], onChange, editable = true, theme, style }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [color, setColor] = useState(COLORS[0]);
  const [currentPath, setCurrentPath] = useState(null);
  const currentPoints = useRef([]);
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const colorRef = useRef(color);
  colorRef.current = color;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editable,
      onMoveShouldSetPanResponder: () => editable,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPoints.current = [[locationX, locationY]];
        setCurrentPath(`M${locationX},${locationY}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPoints.current.push([locationX, locationY]);
        setCurrentPath((prev) => `${prev}L${locationX},${locationY} `);
      },
      onPanResponderRelease: () => {
        const { width, height } = sizeRef.current;
        if (currentPoints.current.length > 1 && width && height) {
          const normalized = currentPoints.current.map(([x, y]) => [x / width, y / height]);
          onChangeRef.current?.([...strokesRef.current, { points: normalized, color: colorRef.current }]);
        }
        currentPoints.current = [];
        setCurrentPath(null);
      },
    })
  ).current;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[styles.canvas, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
        onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        {...(editable ? panResponder.panHandlers : {})}
      >
        <Svg width="100%" height="100%">
          {strokes.map((stroke, i) => (
            <Path
              key={i}
              d={pathFromPoints(stroke.points.map(([x, y]) => [x * size.width, y * size.height]))}
              stroke={stroke.color}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath && (
            <Path
              d={currentPath}
              stroke={color}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      </View>

      {editable && (
        <View style={styles.toolbar}>
          <View style={styles.swatches}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                hitSlop={6}
                style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]}
              />
            ))}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onChange?.(strokes.slice(0, -1))} disabled={!strokes.length} hitSlop={6}>
              <Text style={[styles.actionText, { color: theme.textSub, opacity: strokes.length ? 1 : 0.4 }]}>
                Undo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onChange?.([])} disabled={!strokes.length} hitSlop={6}>
              <Text style={[styles.actionText, { color: "#e53935", opacity: strokes.length ? 1 : 0.4 }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  canvas: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  swatches: { flexDirection: "row", gap: 10 },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  actions: { flexDirection: "row", gap: 20 },
  actionText: { fontSize: 14, fontWeight: "600" },
});
