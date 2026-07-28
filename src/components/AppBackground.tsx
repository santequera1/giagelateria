import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { metrics } from '../theme/metrics';

/**
 * Warm pearl app background (SPEC §2):
 * diagonal CSS linear-gradient (#F8F0EC -> #F3E4DE -> #FBEFE6) plus two soft
 * decorative white blobs (top-left, mid-right). The blur is faked with
 * layered concentric circles so it renders identically on iOS/Android.
 *
 * Angle: expo-linear-gradient start{0,0}->end{1,1} runs corner-to-corner, so
 * the equivalent CSS angle is 90deg + atan2(height, width) of the window
 * (CSS 135deg would only match on a square view). Colors and evenly-spaced
 * stops are unchanged.
 */
const SoftBlob: React.FC<{
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}> = ({ size, top, left, right, bottom }) => {
  const rings = [
    { scale: 1, opacity: 0.16 },
    { scale: 0.78, opacity: 0.2 },
    { scale: 0.56, opacity: 0.26 },
    { scale: 0.36, opacity: 0.3 },
  ];
  return (
    <View pointerEvents="none" style={[styles.blobWrap, { top, left, right, bottom, width: size, height: size }]}>
      {rings.map((r) => {
        const d = size * r.scale;
        return (
          <View
            key={r.scale}
            style={{
              position: 'absolute',
              width: d,
              height: d,
              borderRadius: d / 2,
              backgroundColor: colors.blob,
              opacity: r.opacity,
              top: (size - d) / 2,
              left: (size - d) / 2,
            }}
          />
        );
      })}
    </View>
  );
};

export const AppBackground: React.FC<{ children?: React.ReactNode }> = React.memo(
  ({ children }) => (
    <View style={styles.root}>
      <SoftBlob size={260} top={-60} left={-60} />
      <SoftBlob size={300} top={metrics.screen.height * 0.42} right={-90} />
      {children}
    </View>
  ),
);
AppBackground.displayName = 'AppBackground';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Color sólido: experimental_backgroundImage no renderiza en web y dejaba
    // el fondo blanco. La crema GIA es la base exacta del patrón.
    backgroundColor: colors.creamText,
  },
  blobWrap: {
    position: 'absolute',
  },
});
