import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { metrics } from '../../theme/metrics';
import { typography } from '../../theme/typography';
import { CartIcon, ChevronsRightIcon } from '../icons';


/* ----------------------------------------------------------------------- */
/* IconCircleButton                                                         */
/* ----------------------------------------------------------------------- */

export interface IconCircleButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  /** Light halo ring (3px, 85% white) — used by the home card cart FAB. */
  halo?: boolean;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Circular icon button with a soft press-scale (used for back/FAB/qty). */
export const IconCircleButton: React.FC<IconCircleButtonProps> = React.memo(
  ({
    icon,
    onPress,
    size = 52,
    backgroundColor = 'transparent',
    borderColor,
    halo,
    shadow,
    style,
  }) => {
    const pressed = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: 1 - pressed.value * 0.08 }],
    }));
    return (
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
            borderColor: borderColor ?? 'transparent',
          },
          halo ? styles.circleHalo : null,
          shadow ? styles.circleShadow : null,
          animatedStyle,
          style,
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={() => {
            pressed.value = withTiming(1, { duration: 100 });
          }}
          onPressOut={() => {
            pressed.value = withTiming(0, { duration: 180 });
          }}
          hitSlop={8}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none">{icon}</View>
      </Animated.View>
    );
  },
);
IconCircleButton.displayName = 'IconCircleButton';

/* ----------------------------------------------------------------------- */
/* Shared bar layout                                                        */
/* ----------------------------------------------------------------------- */

interface BarProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const usePressScale = () => {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.025 }],
  }));
  const handlers = {
    onPressIn: () => {
      pressed.value = withTiming(1, { duration: 120 });
    },
    onPressOut: () => {
      pressed.value = withTiming(0, { duration: 200 });
    },
  };
  return { animatedStyle, handlers };
};

/* ----------------------------------------------------------------------- */
/* AddToCartBar                                                             */
/* ----------------------------------------------------------------------- */

/**
 * Burgundy Add To Cart bar (SPEC §2/§5): height 72, radius 36, label
 * centered-left, right inner cream circle ∅56 with burgundy cart icon.
 * This is the cart fly-out animation target.
 */
export const AddToCartBar: React.FC<BarProps> = React.memo(({ onPress, style }) => {
  const { animatedStyle, handlers } = usePressScale();
  return (
    <Animated.View style={[styles.barShadow, animatedStyle, style]}>
      <Pressable onPress={onPress} {...handlers} style={styles.pressFill}>
        <View
          style={[
            styles.bar,
            {
              height: metrics.addToCartHeight,
              borderRadius: metrics.radiusBar,
              backgroundColor: colors.primary,
            },
          ]}
        >
          <View style={styles.sideSpacer} />
          <Text style={[typography.addToCart, styles.barLabel]}>Agregar al carrito</Text>
          <View
            style={[
              styles.barCircle,
              {
                width: metrics.addToCartCircle,
                height: metrics.addToCartCircle,
                borderRadius: metrics.addToCartCircle / 2,
              },
            ]}
          >
            <CartIcon size={26} color={colors.primary} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});
AddToCartBar.displayName = 'AddToCartBar';

/* ----------------------------------------------------------------------- */
/* MakePaymentBar                                                           */
/* ----------------------------------------------------------------------- */

/**
 * White Make Payment bar (SPEC §2/§5): height 76, radius 38, right cream
 * circle ∅60 with burgundy "›››" chevrons.
 */
export const MakePaymentBar: React.FC<BarProps> = React.memo(({ onPress, style }) => {
  const { animatedStyle, handlers } = usePressScale();
  return (
    <Animated.View style={[styles.paymentShadow, animatedStyle, style]}>
      <Pressable onPress={onPress} {...handlers} style={styles.pressFill}>
        <View
          style={[
            styles.bar,
            styles.paymentBar,
            { height: metrics.makePaymentHeight, borderRadius: metrics.makePaymentHeight / 2 },
          ]}
        >
          <View style={styles.sideSpacer} />
          <Text style={[typography.makePayment, styles.barLabel]}>Pedir por WhatsApp</Text>
          <View
            style={[
              styles.barCircle,
              {
                width: metrics.makePaymentCircle,
                height: metrics.makePaymentCircle,
                borderRadius: metrics.makePaymentCircle / 2,
              },
            ]}
          >
            <ChevronsRightIcon size={26} color={colors.burgundy} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});
MakePaymentBar.displayName = 'MakePaymentBar';

/* ----------------------------------------------------------------------- */

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  circleHalo: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  circleShadow: {
    shadowColor: colors.burgundyDark,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  barShadow: {
    borderRadius: metrics.radiusBar,
    shadowColor: colors.burgundyDark,
    shadowOpacity: 0.32,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  paymentShadow: {
    borderRadius: metrics.makePaymentHeight / 2,
    shadowColor: colors.burgundyDark,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  pressFill: {
    flex: 1,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  paymentBar: {
    backgroundColor: colors.white,
  },
  sideSpacer: {
    width: metrics.addToCartCircle,
  },
  barLabel: {
    flex: 1,
    textAlign: 'center',
  },
  barCircle: {
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
