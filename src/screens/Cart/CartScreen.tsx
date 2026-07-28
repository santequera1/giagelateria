import React, { useCallback, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppBackground } from '../../components/AppBackground';
import { CartShape } from '../../components/CartShape/CartShape';
import { PriceTag } from '../../components/PriceTag/PriceTag';
import { IconCircleButton, MakePaymentBar } from '../../components/Buttons/Buttons';
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from '../../components/icons';
import { DESSERT_CUP_IMAGE } from '../../constants/products';
import { whatsappUrl } from '../../constants/business';
import { EnrichedCartLine, useCartLines } from '../../services/cartStore';
import { useCart } from '../../hooks/useCart';
import { useHaptics } from '../../hooks/useHaptics';
import { colors } from '../../theme/colors';
import { metrics } from '../../theme/metrics';
import { typography } from '../../theme/typography';
import { formatCOP, formatPrice } from '../../utils/format';

/** MakePaymentBar entrance: slides up 40 -> 0 + fade, delay 300ms (SPEC §6). */
const paymentEnter = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 40 }] },
    animations: {
      opacity: withDelay(300, withTiming(1, { duration: 450 })),
      transform: [{ translateY: withDelay(300, withTiming(0, { duration: 450 })) }],
    },
  };
};

const SUMMARY_HEIGHT = 172;
const SUMMARY_DIVIDER_Y = 60;

/** Memoized cart row: thumbnail, nombre/tamaño, stepper de cantidad y eliminar. */
const CartRow: React.FC<{ line: EnrichedCartLine; index: number }> = React.memo(
  ({ line, index }) => {
    const { setQty, remove } = useCart();
    const haptics = useHaptics();

    const dec = useCallback(() => {
      haptics.light();
      setQty(line.productId, line.sizeId, line.qty - 1, line.secondProductId);
    }, [haptics, setQty, line.productId, line.sizeId, line.qty, line.secondProductId]);
    const inc = useCallback(() => {
      haptics.light();
      setQty(line.productId, line.sizeId, line.qty + 1, line.secondProductId);
    }, [haptics, setQty, line.productId, line.sizeId, line.qty, line.secondProductId]);
    const onRemove = useCallback(() => {
      haptics.light();
      remove(line.productId, line.sizeId, line.secondProductId);
    }, [haptics, remove, line.productId, line.sizeId, line.secondProductId]);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 80).duration(350)}
        style={styles.row}
      >
        <View style={styles.thumbCircle}>
          <Image
            source={line.product.image}
            style={styles.thumbImage}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>
        <View style={styles.rowText}>
          <Text style={typography.cartRowName}>{line.displayName}</Text>
          <Text style={typography.cartRowSubtitle}>{line.size.label}</Text>
          <View style={styles.stepperRow}>
            <Pressable onPress={dec} hitSlop={6} style={styles.stepBtn}>
              <MinusIcon size={14} color={colors.white} />
            </Pressable>
            <Text style={styles.stepQty}>{line.qty}</Text>
            <Pressable onPress={inc} hitSlop={6} style={styles.stepBtn}>
              <PlusIcon size={14} color={colors.white} />
            </Pressable>
          </View>
        </View>
        <View style={styles.rowRight}>
          <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
            <TrashIcon size={17} color={colors.onDarkMuted} />
          </Pressable>
          <PriceTag value={line.lineTotal} variant="light" />
        </View>
      </Animated.View>
    );
  },
);
CartRow.displayName = 'CartRow';

/**
 * Cart screen (SPEC §6): header + cream badge, the signature burgundy
 * CartShape container with staggered rows, pink summary CartShape card
 * (bottom notch + divider) with the dessert illustration, and the white
 * MakePaymentBar pinned at the bottom.
 */
export const CartScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { totalCount, total } = useCart();
  const lines = useCartLines();
  const haptics = useHaptics();

  const close = useCallback(() => {
    haptics.light();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [haptics, router]);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [summarySize, setSummarySize] = useState({ width: 0, height: 0 });

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize((p) => (p.width === width && p.height === height ? p : { width, height }));
  }, []);
  const onSummaryLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSummarySize((p) => (p.width === width && p.height === height ? p : { width, height }));
  }, []);

  /** Arma el pedido y lo envía por WhatsApp. */
  const onPay = useCallback(() => {
    haptics.light();
    if (lines.length === 0) return;
    const detail = lines
      .map(
        (l) =>
          `• ${l.qty} x ${l.displayName} (${l.size.label}) — ${formatPrice(l.lineTotal, {
            space: true,
          })}`,
      )
      .join('\n');
    const twoFlavorNote = lines.some((l) => l.size.flavors === 2 && !l.secondProductId)
      ? '\nLos tamaños de dos sabores sin combinación elegida: te confirmo el segundo sabor por aquí 🙂'
      : '';
    const message = `¡Hola GIA! 🍦 Quiero hacer este pedido:\n${detail}\nTotal: ${formatPrice(
      total,
      { space: true },
    )}${twoFlavorNote}`;
    Linking.openURL(whatsappUrl(message));
  }, [haptics, lines, total]);

  return (
    <AppBackground>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={typography.cartHeader}>Carrito</Text>
          <View style={styles.headerRight}>
            <View style={styles.badge}>
              <Text style={typography.badge}>{totalCount}</Text>
            </View>
            <IconCircleButton
              icon={<CloseIcon size={20} color={colors.text} />}
              size={metrics.badgeSize}
              backgroundColor={colors.white70}
              onPress={close}
            />
          </View>
        </View>

        {/* Burgundy container */}
        <View style={styles.container} onLayout={onContainerLayout}>
          <CartShape
            width={containerSize.width}
            height={containerSize.height}
            colors={colors.burgundyGradient}
            cornerRadius={metrics.radiusCartContainer}
            notchDepth={10}
            notchWidth={90}
            squareBottom
          >
            <View style={styles.containerInner}>
              {/* Rows */}
              <ScrollView
                style={styles.rowsScroll}
                contentContainerStyle={styles.rowsContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {lines.length === 0 ? (
                  <Text style={styles.emptyText}>Tu carrito está vacío</Text>
                ) : (
                  lines.map((line, i) => (
                    <CartRow
                      key={`${line.productId}-${line.sizeId}-${line.secondProductId ?? ''}`}
                      line={line}
                      index={i}
                    />
                  ))
                )}
              </ScrollView>

              {/* Summary card */}
              <View
                style={[styles.summary, { height: SUMMARY_HEIGHT }]}
                onLayout={onSummaryLayout}
              >
                <CartShape
                  width={summarySize.width}
                  height={summarySize.height}
                  colors={colors.summaryGradient}
                  cornerRadius={metrics.radiusSummary}
                  notchDepth={9}
                  notchWidth={84}
                  bottomNotch
                  divider
                  dividerY={SUMMARY_DIVIDER_Y}
                >
                  <View style={styles.summaryInner}>
                    <View style={styles.summaryRow}>
                      <Text style={typography.summaryLabel}>Domicilio</Text>
                      <Text style={typography.summaryValue}>Se coordina por WhatsApp</Text>
                    </View>
                    <View style={styles.summaryTotalBlock}>
                      <Text style={typography.summaryLabel}>Total del pedido</Text>
                      <Text style={typography.summaryTotal}>{formatCOP(total)}</Text>
                    </View>
                  </View>
                </CartShape>
                {/* Dessert illustration overlapping the bottom-right edge */}
                <Image
                  source={DESSERT_CUP_IMAGE}
                  style={styles.dessert}
                  resizeMode="contain"
                  fadeDuration={0}
                />
              </View>

              {/* Make Payment */}
              <Animated.View entering={paymentEnter}>
                <MakePaymentBar
                  onPress={onPay}
                  style={[
                    styles.paymentBar,
                    { marginBottom: insets.bottom > 0 ? insets.bottom + 12 : 24 },
                  ]}
                />
              </Animated.View>
            </View>
          </CartShape>
          {/* White handle dash floating above the notch */}
          <View pointerEvents="none" style={styles.handle} />
        </View>
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.paddingCart,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: metrics.badgeSize,
    height: metrics.badgeSize,
    borderRadius: metrics.badgeSize / 2,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    marginTop: 34,
  },
  containerInner: {
    flex: 1,
    paddingTop: 40,
  },
  rowsScroll: {
    flex: 1,
  },
  rowsContent: {
    paddingHorizontal: 28,
    gap: metrics.rowGap,
    paddingBottom: 12,
  },
  emptyText: {
    ...typography.cartRowName,
    color: colors.onDarkFaint,
    textAlign: 'center',
    marginTop: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbCircle: {
    width: metrics.cartThumb,
    height: metrics.cartThumb,
    borderRadius: metrics.cartThumb / 2,
    backgroundColor: colors.white12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: 54,
    height: 54,
  },
  rowText: {
    flex: 1,
    marginLeft: 18,
    justifyContent: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    color: colors.white,
    fontSize: 14,
    minWidth: 18,
    textAlign: 'center',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  removeBtn: {
    padding: 2,
  },
  summary: {
    marginHorizontal: 24,
    marginTop: 12,
  },
  summaryInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTotalBlock: {
    marginTop: 30,
  },
  dessert: {
    position: 'absolute',
    right: 8,
    bottom: -14,
    width: 110,
    height: 110,
    transform: [{ rotate: '8deg' }],
  },
  paymentBar: {
    marginHorizontal: 24,
    marginTop: 20,
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
