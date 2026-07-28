import { useEffect } from 'react';
import {
  AnimatedStyle,
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

export interface FloatingLoopOptions {
  /** translateY amplitude in px (±). Default 6. */
  amplitude?: number;
  /** Rotation wobble amplitude in deg (±). Default 2. */
  rotateAmplitude?: number;
  /** Breathing scale peak. Default 1.02. */
  scalePeak?: number;
  /** Half-cycle duration (one direction). Default 2800ms. */
  duration?: number;
  /** Constant base rotation in deg (home card uses +18). */
  baseRotation?: number;
  /** Set false to disable the loop (e.g. off-screen cards). */
  enabled?: boolean;
}

/**
 * Continuous floating / breathing loop (SPEC §5 ProductImage):
 * translateY ±6 over 2.8s ease-in-out, rotate ±2deg, scale 1 <-> 1.02.
 * Runs fully on the UI thread via Reanimated shared values.
 */
export const useFloatingLoop = (
  options: FloatingLoopOptions = {},
): AnimatedStyle<ViewStyle> => {
  const {
    amplitude = 6,
    rotateAmplitude = 2,
    scalePeak = 1.02,
    duration = 2800,
    baseRotation = 0,
    enabled = true,
  } = options;

  const progress = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return undefined;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(progress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, duration]);

  return useAnimatedStyle(() => {
    'worklet';
    const translateY = interpolate(progress.value, [0, 1], [-amplitude, amplitude]);
    const rotate =
      baseRotation + interpolate(progress.value, [0, 1], [-rotateAmplitude, rotateAmplitude]);
    const scale = interpolate(progress.value, [0, 1], [1, scalePeak]);
    return {
      transform: [{ translateY }, { rotate: `${rotate}deg` }, { scale }],
    };
  }, [amplitude, rotateAmplitude, scalePeak, baseRotation]);
};
