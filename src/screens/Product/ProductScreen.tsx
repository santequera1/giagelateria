import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppBackground } from '../../components/AppBackground';
import { ProductImage } from '../../components/ProductImage/ProductImage';
import { PriceTag } from '../../components/PriceTag/PriceTag';
import { AddToCartBar, IconCircleButton } from '../../components/Buttons/Buttons';
import { CategoryChip } from '../../components/CategoryChip/CategoryChip';
import { CartIcon, ChevronLeftIcon, MinusIcon, PlusIcon } from '../../components/icons';
import { useLiquidSwipe } from '../../animations/useLiquidSwipe';
import {
  DEFAULT_SIZE_ID,
  PRODUCTS,
  SIZES,
  productIndexById,
  sizeById,
} from '../../constants/products';
import { useCart } from '../../hooks/useCart';
import { useHaptics } from '../../hooks/useHaptics';
import { colors } from '../../theme/colors';
import { metrics } from '../../theme/metrics';
import { typography } from '../../theme/typography';
import { formatQty } from '../../utils/format';

export interface ProductScreenProps {
  /** Route param from app/product/[id].tsx */
  productId: string;
}

/* Custom entering/exiting builders (title cross-fade: translateY 12 + fade). */
const titleEnter = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 12 }] },
    animations: {
      opacity: withTiming(1, { duration: 300 }),
      transform: [{ translateY: withTiming(0, { duration: 300 }) }],
    },
  };
};
const titleExit = () => {
  'worklet';
  return {
    initialValues: { opacity: 1, transform: [{ translateY: 0 }] },
    animations: {
      opacity: withTiming(0, { duration: 200 }),
      transform: [{ translateY: withTiming(-12, { duration: 200 }) }],
    },
  };
};
/** Price pill scale-pop. */
const pillPop = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.8 }] },
    animations: {
      opacity: withTiming(1, { duration: 250 }),
      transform: [{ scale: withSpring(1, { damping: 12, stiffness: 180 }) }],
    },
  };
};
/** Quantity count-up tick. */
const countEnter = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 10 }] },
    animations: {
      opacity: withTiming(1, { duration: 180 }),
      transform: [{ translateY: withTiming(0, { duration: 180 }) }],
    },
  };
};

/**
 * Product Detail (SPEC §6): header with back button + centered name, large
 * floating product image with soft elliptical shadow, quantity stepper,
 * cream price pill and the burgundy AddToCartBar. Horizontal pan performs
 * the liquid-swipe product switch; the screen tint cross-fades toward the
 * active flavor's card color.
 */
export const ProductScreen: React.FC<ProductScreenProps> = ({ productId }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { add, totalCount } = useCart();

  const width = metrics.screen.width;
  /** El escenario se mide para que imagen + sombra siempre quepan, incluso
      cuando el selector de segundo sabor reduce el espacio disponible. */
  const [stageH, setStageH] = useState(0);
  const onStageLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    setStageH((prev) => (prev === h ? prev : h));
  }, []);
  const imageSize = Math.max(
    150,
    Math.min(300, Math.round(width * 0.78), stageH > 0 ? stageH - 80 : 300),
  );

  const swipe = useLiquidSwipe({
    width,
    count: PRODUCTS.length,
    initialIndex: productIndexById(productId),
  });

  const product = PRODUCTS[swipe.index];
  const prevProduct = PRODUCTS[(swipe.index - 1 + PRODUCTS.length) % PRODUCTS.length];
  const nextProduct = PRODUCTS[(swipe.index + 1) % PRODUCTS.length];

  const [qty, setQty] = useState(1);
  const [sizeId, setSizeId] = useState(DEFAULT_SIZE_ID);
  const size = sizeById(sizeId);
  /** Segundo sabor para tamaños de dos sabores (null = aún sin elegir). */
  const [secondId, setSecondId] = useState<string | null>(null);
  const secondProduct = secondId ? PRODUCTS.find((p) => p.id === secondId) : undefined;
  /** Aviso "agregado al carrito". */
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  /* Screen background tint cross-fade toward product.cardColors.bg. */
  const [prevBg, setPrevBg] = useState(product.cardColors.bg);
  const bgRef = useRef(product.cardColors.bg);
  const wipe = useSharedValue(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setQty(1); // quantity resets to 1 on switch
    setSecondId(null); // el segundo sabor se elige por producto
    setPrevBg(bgRef.current);
    bgRef.current = product.cardColors.bg;
    wipe.value = 1;
    wipe.value = withTiming(0, { duration: 550 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swipe.index]);

  const wipeStyle = useAnimatedStyle(() => ({
    opacity: wipe.value * 0.4,
  }));

  /* Brief quantity pulse as add-to-cart feedback. */
  const qtyPulse = useSharedValue(1);
  const qtyPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: qtyPulse.value }],
  }));

  const inc = useCallback(() => {
    haptics.light();
    setQty((q) => Math.min(99, q + 1));
  }, [haptics]);
  const dec = useCallback(() => {
    haptics.light();
    setQty((q) => Math.max(1, q - 1));
  }, [haptics]);
  const selectSize = useCallback(
    (id: string) => {
      haptics.light();
      setSizeId(id);
    },
    [haptics],
  );
  const selectSecond = useCallback(
    (id: string) => {
      haptics.light();
      setSecondId((prev) => (prev === id ? null : id));
    },
    [haptics],
  );
  const onAdd = useCallback(() => {
    haptics.light();
    const second = size.flavors === 2 && secondId ? secondId : undefined;
    add(product.id, sizeId, qty, second);
    qtyPulse.value = withSequence(
      withTiming(1.18, { duration: 120 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    const name = second
      ? `${product.name} + ${PRODUCTS.find((p) => p.id === second)?.name ?? ''}`
      : product.name;
    setToast(`${qty} x ${name} (${size.label}) agregado ✓`);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, [add, haptics, product.id, product.name, size, sizeId, secondId, qty, qtyPulse]);
  const goBack = useCallback(() => {
    haptics.light();
    // Si se entró directo por URL (o tras recargar) no hay historial.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [haptics, router]);

  return (
    <AppBackground>
      {/* Flavor tint layers */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: product.cardColors.bg, opacity: 0.4 }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: prevBg }, wipeStyle]}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.headerRow, styles.headerRowSplit]}>
          <IconCircleButton
            icon={<ChevronLeftIcon size={24} color={colors.text} />}
            size={metrics.backButton}
            backgroundColor={colors.white70}
            onPress={goBack}
          />
          <View>
            <IconCircleButton
              icon={<CartIcon size={22} color={colors.text} />}
              size={metrics.backButton}
              backgroundColor={colors.white70}
              onPress={() => router.push('/cart')}
            />
            {totalCount > 0 && (
              <View pointerEvents="none" style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCount}</Text>
              </View>
            )}
          </View>
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.headerTitleWrap,
            { top: insets.top + 8, height: metrics.backButton },
          ]}
        >
          <Animated.Text
            key={product.id}
            entering={titleEnter}
            exiting={titleExit}
            style={typography.detailTitle}
          >
            {product.name}
          </Animated.Text>
        </View>
      </View>

      {/* Liquid swipe stage */}
      <GestureDetector gesture={swipe.gesture}>
        <Animated.View style={styles.stage} onLayout={onStageLayout}>
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.center, swipe.prevStyle]}
            pointerEvents="none"
          >
            <ProductImage source={prevProduct.image} size={imageSize} />
          </Animated.View>
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.center, swipe.nextStyle]}
            pointerEvents="none"
          >
            <ProductImage source={nextProduct.image} size={imageSize} />
          </Animated.View>

          {/* Soft elliptical shadow under the floating tub */}
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.center, swipe.shadowStyle]}
          >
            <View style={{ marginTop: imageSize + 16 }}>
              <View style={styles.shadowOuter}>
                <View style={styles.shadowMid}>
                  <View style={styles.shadowCore} />
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={ZoomIn.duration(400)}
            style={[StyleSheet.absoluteFill, styles.center, swipe.currentStyle]}
            pointerEvents="none"
          >
            <ProductImage source={product.image} size={imageSize} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* Bottom cluster: size, quantity, price pill, AddToCartBar */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.sizeRow}>
          {SIZES.map((s) => (
            <CategoryChip
              key={s.id}
              label={s.label}
              variant="text"
              active={sizeId === s.id}
              onPress={() => selectSize(s.id)}
            />
          ))}
        </View>
        <Text style={[typography.caption, styles.sizeCaption]}>
          {size.flavors === 2
            ? secondProduct
              ? `Dos sabores: ${product.name} + ${secondProduct.name}`
              : 'Dos sabores — elige el segundo:'
            : 'Un solo sabor'}
        </Text>
        {size.flavors === 2 && (
          <Animated.View
            entering={FadeInDown.duration(260)}
            exiting={FadeOutUp.duration(180)}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.secondScroll}
              contentContainerStyle={styles.secondContent}
            >
              {PRODUCTS.filter((p) => p.id !== product.id).map((p) => (
                <CategoryChip
                  key={p.id}
                  label={p.name}
                  variant="text"
                  active={secondId === p.id}
                  onPress={() => selectSecond(p.id)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}
        <View style={styles.qtyRow}>
          <IconCircleButton
            icon={<PlusIcon size={28} color={colors.text} />}
            size={metrics.qtyButton}
            onPress={inc}
          />
          <Animated.Text
            key={qty}
            entering={countEnter}
            style={[typography.quantity, qtyPulseStyle]}
          >
            {formatQty(qty)}
          </Animated.Text>
          <IconCircleButton
            icon={<MinusIcon size={28} color={colors.text} />}
            size={metrics.qtyButton}
            onPress={dec}
          />
        </View>

        <Animated.View
          key={`${product.id}-${sizeId}-${qty}`}
          entering={pillPop}
          style={styles.pillWrap}
        >
          <PriceTag value={size.price * qty} variant="cream" />
        </Animated.View>

        <AddToCartBar onPress={onAdd} style={styles.addBar} />
      </View>

      {/* Confirmación de agregado */}
      {toast && (
        <Animated.View
          entering={FadeInDown.duration(250)}
          exiting={FadeOutUp.duration(250)}
          pointerEvents="none"
          style={[styles.toast, { top: insets.top + metrics.backButton + 20 }]}
        >
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      )}
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: metrics.paddingDetail,
  },
  headerRow: {
    height: metrics.backButton,
    justifyContent: 'center',
  },
  headerRowSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  headerTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    flex: 1,
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowOuter: {
    width: 230,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowMid: {
    width: 185,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowCore: {
    width: 140,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  bottom: {
    paddingHorizontal: metrics.paddingDetail,
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sizeCaption: {
    textAlign: 'center',
    marginBottom: 10,
  },
  secondScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  secondContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.burgundy,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    zIndex: 10,
    shadowColor: colors.burgundyDark,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  toastText: {
    color: colors.white,
    fontSize: 14,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pillWrap: {
    alignSelf: 'center',
    marginTop: 14,
  },
  addBar: {
    marginTop: 24,
  },
});
