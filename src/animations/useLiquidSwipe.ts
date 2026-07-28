import { useCallback, useEffect, useRef, useState } from 'react';
import { ViewStyle } from 'react-native';
import { Gesture, PanGesture } from 'react-native-gesture-handler';
import {
  AnimatedStyle,
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export interface LiquidSwipeConfig {
  /** Stage width (usually screen width). */
  width: number;
  /** Number of items in the carousel loop. */
  count: number;
  /** Starting index. */
  initialIndex?: number;
  /** Called (JS thread) after a committed switch settles. */
  onIndexChange?: (index: number) => void;
}

export interface LiquidSwipe {
  /** Active item index (JS state — only changes on commit, never mid-gesture). */
  index: number;
  /** -1 = swiped to previous, 1 = swiped to next, 0 = idle. */
  lastDirection: number;
  /** Attach to a GestureDetector wrapping the swipe stage. */
  gesture: PanGesture;
  /** Raw drag offset shared value (for shadows / parallax extras). */
  offset: SharedValue<number>;
  /** Liquid drag style for the outgoing/current item. */
  currentStyle: AnimatedStyle<ViewStyle>;
  /** Style for the item revealed from the right (next). */
  nextStyle: AnimatedStyle<ViewStyle>;
  /** Style for the item revealed from the left (previous). */
  prevStyle: AnimatedStyle<ViewStyle>;
  /** Fading elliptical shadow under the current item. */
  shadowStyle: AnimatedStyle<ViewStyle>;
}

const SPRING_COMMIT = { damping: 12, stiffness: 90 };
const SPRING_SNAP_BACK = { damping: 12, stiffness: 140 };

/**
 * Liquid-swipe product switching (SPEC §6 Product Detail).
 *
 * - Drag: current item translateX + scaleX stretch (1 + |x|/400) + skewX ±8deg.
 * - Neighbor items parallax in from the sides.
 * - Release past 40% width (or fast flick): commit with a springy overshoot
 *   (withSpring damping 12 stiffness 90), otherwise elastic snap-back.
 * All motion is driven by Reanimated shared values — no setState during drag.
 */
export const useLiquidSwipe = ({
  width,
  count,
  initialIndex = 0,
  onIndexChange,
}: LiquidSwipeConfig): LiquidSwipe => {
  const [index, setIndex] = useState(initialIndex);
  const [lastDirection, setLastDirection] = useState(0);

  const offset = useSharedValue(0);
  const widthRef = useRef(width);
  widthRef.current = width;
  const countRef = useRef(count);
  countRef.current = count;
  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;

  /**
   * Commit inmediato en el hilo JS. Antes el cambio de producto dependía del
   * callback de finalización del spring, que en web puede no dispararse — la
   * imagen se deslizaba pero el producto (nombre/precio) no cambiaba. Ahora
   * el índice avanza apenas el gesto cruza el umbral, y el offset se
   * recoloca para que el nuevo producto entre desde donde venía el vecino.
   */
  const commit = useCallback(
    (direction: 1 | -1, fromX: number) => {
      setLastDirection(direction);
      setIndex((prev) => (prev + direction + countRef.current) % countRef.current);
      const w = widthRef.current;
      offset.value = fromX + (direction === 1 ? w : -w);
      offset.value = withSpring(0, SPRING_COMMIT);
    },
    [offset],
  );

  useEffect(() => {
    onIndexChangeRef.current?.(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-16, 16])
    .onUpdate((e) => {
      'worklet';
      offset.value = e.translationX;
    })
    .onEnd((e) => {
      'worklet';
      const w = widthRef.current;
      const x = e.translationX;
      const vx = e.velocityX;
      const threshold = w * 0.4;
      if (x <= -threshold || vx < -550) {
        // Commit — next product (el índice cambia ya, sin esperar al spring).
        runOnJS(commit)(1, x);
      } else if (x >= threshold || vx > 550) {
        // Commit — previous product.
        runOnJS(commit)(-1, x);
      } else {
        // Elastic snap-back.
        offset.value = withSpring(0, { ...SPRING_SNAP_BACK, velocity: vx });
      }
    });

  const currentStyle = useAnimatedStyle(() => {
    'worklet';
    const x = offset.value;
    const absX = Math.abs(x);
    // Deformación muy sutil: el estiramiento agresivo original se veía mal
    // con fotos reales. Solo un leve estiramiento + inclinación.
    const stretch = Math.min(absX / 1600, 0.06);
    const skew = interpolate(x, [-width, 0, width], [2.5, 0, -2.5], Extrapolation.CLAMP);
    return {
      transform: [
        { translateX: x },
        { scaleX: 1 + stretch },
        { scaleY: 1 - Math.min(absX / 4000, 0.05) },
        { skewX: `${skew}deg` },
      ],
      opacity: interpolate(absX, [0, width * 0.9], [1, 0.25], Extrapolation.CLAMP),
      zIndex: 3,
    };
  }, [width]);

  const nextStyle = useAnimatedStyle(() => {
    'worklet';
    const x = offset.value;
    return {
      transform: [
        { translateX: x + width },
        { scale: interpolate(x, [-width, 0], [1, 0.9], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(x, [-width, 0], [1, 0.4], Extrapolation.CLAMP),
      zIndex: 2,
    };
  }, [width]);

  const prevStyle = useAnimatedStyle(() => {
    'worklet';
    const x = offset.value;
    return {
      transform: [
        { translateX: x - width },
        { scale: interpolate(x, [0, width], [0.9, 1], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(x, [0, width], [0.4, 1], Extrapolation.CLAMP),
      zIndex: 1,
    };
  }, [width]);

  const shadowStyle = useAnimatedStyle(() => {
    'worklet';
    const absX = Math.abs(offset.value);
    return {
      opacity: interpolate(absX, [0, width], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateX: offset.value * 0.35 }],
    };
  }, [width]);

  return {
    index,
    lastDirection,
    gesture,
    offset,
    currentStyle,
    nextStyle,
    prevStyle,
    shadowStyle,
  };
};
