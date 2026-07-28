import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { metrics } from '../../theme/metrics';
import { typography } from '../../theme/typography';

export interface CategoryChipProps {
  /** Text label (text + iconLabel variants). */
  label?: string;
  /** Icon element (iconLabel + icon variants). */
  icon?: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  /** text = label only, iconLabel = icon + label pill, icon = circular icon chip. */
  variant?: 'text' | 'iconLabel' | 'icon';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Category chip with animated bg color / scale on selection
 * (withTiming 200ms) — SPEC §5.
 */
export const CategoryChip: React.FC<CategoryChipProps> = React.memo(
  ({ label, icon, active = false, onPress, variant = 'text' }) => {
    const progress = useSharedValue(active ? 1 : 0);
    const pressed = useSharedValue(0);

    useEffect(() => {
      progress.value = withTiming(active ? 1 : 0, { duration: 200 });
    }, [active, progress]);

    const isCircle = variant === 'icon';

    const animatedStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        progress.value,
        [0, 1],
        [colors.chipInactiveBg, colors.chipActiveBg],
      );
      const borderColor = interpolateColor(
        progress.value,
        [0, 1],
        ['rgba(243,207,216,0)', colors.chipActiveBorder],
      );
      const scale = 1 - pressed.value * 0.06;
      return {
        backgroundColor,
        borderColor,
        transform: [{ scale }],
      };
    });

    const textStyle = useAnimatedStyle(() => ({
      color: interpolateColor(progress.value, [0, 1], [colors.textMuted, colors.text]),
    }));

    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 120 });
        }}
        onPressOut={() => {
          pressed.value = withTiming(0, { duration: 160 });
        }}
        hitSlop={6}
        style={[
          styles.base,
          isCircle ? styles.circle : styles.pill,
          animatedStyle,
        ] as ViewStyle[]}
      >
        {icon}
        {label != null && variant !== 'icon' && (
          <Animated.Text style={[typography.chip, icon ? styles.labelGap : null, textStyle]}>
            {label}
          </Animated.Text>
        )}
      </AnimatedPressable>
    );
  },
);
CategoryChip.displayName = 'CategoryChip';

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pill: {
    height: metrics.chipHeight,
    borderRadius: metrics.radiusChip,
    paddingHorizontal: 20,
  },
  circle: {
    width: metrics.chipIconSize,
    height: metrics.chipIconSize,
    borderRadius: metrics.chipIconSize / 2,
  },
  labelGap: {
    marginLeft: 8,
  },
});
