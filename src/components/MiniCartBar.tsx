import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productById } from '../constants/products';
import { useCart } from '../hooks/useCart';
import { colors } from '../theme/colors';
import { metrics } from '../theme/metrics';
import { typography } from '../theme/typography';
import { CartShape } from './CartShape/CartShape';

export interface MiniCartBarProps {
  onPress?: () => void;
}

const MAX_THUMBS = 3;

/**
 * Fixed bottom mini cart bar (SPEC §5/§6): burgundy CartShape with the
 * signature top-center notch + white handle dash, cream count badge,
 * "Cart / n Items" and right stacked overlapping product thumbnails.
 * Tapping navigates to the Cart screen.
 */
export const MiniCartBar: React.FC<MiniCartBarProps> = React.memo(({ onPress }) => {
  const insets = useSafeAreaInsets();
  const { totalCount, items } = useCart();
  const [size, setSize] = useState({ width: 0, height: 0 });

  /* Badge scale-pop whenever the cart count changes (add-to-cart feedback). */
  const badgeScale = useSharedValue(1);
  const skipFirstPop = useRef(true);
  useEffect(() => {
    if (skipFirstPop.current) {
      skipFirstPop.current = false;
      return;
    }
    badgeScale.value = withSequence(
      withSpring(1.35, { damping: 9, stiffness: 320 }),
      withSpring(1, { damping: 12, stiffness: 180 }),
    );
  }, [totalCount, badgeScale]);
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const height = metrics.miniCartHeight + insets.bottom;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === h ? prev : { width, height: h }));
  }, []);

  const uniqueIds = items.map((i) => i.productId).slice(0, MAX_THUMBS);

  // Sin productos no hay nada que mostrar: la barra aparece con el primer agregado.
  if (totalCount === 0) {
    return null;
  }

  return (
    <View style={[styles.root, { height }]} onLayout={onLayout} pointerEvents="box-none">
      <CartShape
        width={size.width}
        height={size.height}
        colors={colors.burgundyGradient}
        cornerRadius={32}
        notchDepth={10}
        notchWidth={90}
        squareBottom
      >
        <Pressable
          onPress={onPress}
          style={[styles.content, { paddingBottom: insets.bottom }]}
        >
          <Animated.View style={[styles.badge, badgeStyle]}>
            <Text style={typography.badge}>{totalCount}</Text>
          </Animated.View>
          <View style={styles.labelBlock}>
            <Text style={typography.miniCartTitle}>Carrito</Text>
            <Text style={typography.miniCartSubtitle}>
              {`${totalCount} ${totalCount === 1 ? 'producto' : 'productos'}`}
            </Text>
          </View>
          <View style={styles.spacer} />
          <View style={styles.thumbs}>
            {uniqueIds.map((id, i) => (
              <View
                key={`${id}-${i}`}
                style={[styles.thumb, i > 0 && { marginLeft: metrics.miniCartThumbOverlap }]}
              >
                <Image
                  source={productById(id).image}
                  style={styles.thumbImage}
                  resizeMode="contain"
                  fadeDuration={0}
                />
              </View>
            ))}
          </View>
        </Pressable>
      </CartShape>
      {/* White handle dash floating above the notch */}
      <View pointerEvents="none" style={styles.handle} />
    </View>
  );
});
MiniCartBar.displayName = 'MiniCartBar';

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  badge: {
    width: metrics.badgeSize,
    height: metrics.badgeSize,
    borderRadius: metrics.badgeSize / 2,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBlock: {
    marginLeft: 14,
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  thumbs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: metrics.miniCartThumb,
    height: metrics.miniCartThumb,
    borderRadius: metrics.miniCartThumb / 2,
    backgroundColor: colors.white12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: 34,
    height: 34,
  },
  handle: {
    position: 'absolute',
    top: -11,
    alignSelf: 'center',
    width: metrics.handleWidth,
    height: metrics.handleHeight,
    borderRadius: metrics.handleHeight / 2,
    backgroundColor: colors.white,
    opacity: 0.85,
  },
});
