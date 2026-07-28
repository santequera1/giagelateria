import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInUp,
  SharedValue,
  ZoomIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { DEFAULT_SIZE_ID, BASE_PRICE, Product } from '../../constants/products';
import { useCart } from '../../hooks/useCart';
import { useHaptics } from '../../hooks/useHaptics';
import { colors } from '../../theme/colors';
import { CARD_WIDTH, metrics } from '../../theme/metrics';
import { typography } from '../../theme/typography';
import { GlassCard } from '../GlassCard/GlassCard';
import { ProductImage } from '../ProductImage/ProductImage';
import { PriceTag } from '../PriceTag/PriceTag';
import { MinusIcon, PlusIcon } from '../icons';

export interface ProductCardProps {
  product: Product;
  /** Horizontal carousel scroll offset (UI-thread shared value). */
  scrollX: SharedValue<number>;
  index: number;
  snapInterval: number;
  /** Card height — defaults to the metrics token, screens may clamp it. */
  height?: number;
  onPress?: (product: Product) => void;
}

/**
 * Home featured card — columna centrada: título, foto, precio y stepper.
 * El movimiento del carrusel anima rotación/escala de la tarjeta, parallax
 * de la foto y fundido de título/precio (todo derivado de scrollX en el
 * hilo de UI). El stepper agrega/quita el tamaño Pequeño con rebote.
 */
export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product, scrollX, index, snapInterval, height = metrics.cardHeight, onPress }) => {
    const haptics = useHaptics();
    const { add, setQty, items } = useCart();

    /** Línea "rápida" de esta tarjeta: tamaño Pequeño sin segundo sabor. */
    const line = items.find(
      (i) => i.productId === product.id && i.sizeId === DEFAULT_SIZE_ID && !i.secondProductId,
    );
    const qty = line?.qty ?? 0;

    /* Rebote del control al cambiar la cantidad. */
    const pop = useSharedValue(1);
    const firstRender = useRef(true);
    useEffect(() => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      pop.value = withSequence(
        withTiming(1.16, { duration: 110 }),
        withSpring(1, { damping: 10, stiffness: 220 }),
      );
    }, [qty, pop]);
    const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

    const inc = useCallback(() => {
      haptics.light();
      add(product.id, DEFAULT_SIZE_ID, 1);
    }, [haptics, add, product.id]);
    const dec = useCallback(() => {
      haptics.light();
      setQty(product.id, DEFAULT_SIZE_ID, qty - 1);
    }, [haptics, setQty, product.id, qty]);

    /* Espacio fijo que ocupan título+subtítulo, precio, botón, paddings y
       gaps de la columna. La foto usa lo que sobre: así el botón nunca se
       recorta por el borde inferior, sin importar la altura del teléfono. */
    const RESERVED_H = 230;
    const imageSize = Math.round(
      Math.max(150, Math.min(height - RESERVED_H, CARD_WIDTH * 0.82)),
    );
    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    const cardStyle = useAnimatedStyle(() => {
      const rotate = interpolate(scrollX.value, inputRange, [4, 0, -4], Extrapolation.CLAMP);
      const scale = interpolate(scrollX.value, inputRange, [0.92, 1, 0.92], Extrapolation.CLAMP);
      const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP);
      return {
        opacity,
        transform: [{ rotate: `${rotate}deg` }, { scale }],
      };
    });

    const tintStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollX.value, inputRange, [0, 0.85, 0], Extrapolation.CLAMP),
    }));

    const imageStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: interpolate(scrollX.value, inputRange, [34, 0, -34], Extrapolation.CLAMP) },
        { scale: interpolate(scrollX.value, inputRange, [0.86, 1, 0.86], Extrapolation.CLAMP) },
      ],
    }));

    const titleStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(scrollX.value, inputRange, [12, 0, -12], Extrapolation.CLAMP) },
      ],
    }));

    const priceStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollX.value, inputRange, [0.1, 1, 0.1], Extrapolation.CLAMP),
    }));

    return (
      <Animated.View
        entering={FadeInUp.delay(120 + index * 70).duration(420)}
        style={[styles.item, { height }, cardStyle]}
      >
        <Pressable onPress={() => onPress?.(product)} style={styles.pressFill}>
          <GlassCard
            style={styles.cardFill}
            tintLayer={
              <Animated.View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: product.cardColors.bg },
                  tintStyle,
                ]}
              />
            }
          >
            <View style={styles.column}>
              {/* Título + subtítulo */}
              <Animated.View style={[styles.titleBlock, titleStyle]}>
                <Text style={styles.title} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={[typography.cardSubtitle, styles.centerText]} numberOfLines={1}>
                  {product.subtitle}
                </Text>
              </Animated.View>

              {/* Foto */}
              <Animated.View style={imageStyle}>
                <ProductImage
                  source={product.image}
                  size={imageSize}
                  imageStyle={styles.imageShadow}
                />
              </Animated.View>

              {/* Precio — texto plano para no confundirlo con un botón */}
              <Animated.View style={priceStyle}>
                <PriceTag
                  value={BASE_PRICE}
                  prefix="Desde "
                  variant="plain"
                  textStyle={styles.priceText}
                />
              </Animated.View>

              {/* Stepper de carrito */}
              <Animated.View style={[styles.stepperWrap, popStyle]}>
                {qty > 0 ? (
                  <View style={styles.stepperPill}>
                    <Pressable onPress={dec} hitSlop={8} style={styles.stepBtn}>
                      <MinusIcon size={18} color={colors.creamText} />
                    </Pressable>
                    <Animated.Text key={qty} entering={ZoomIn.duration(180)} style={styles.stepQty}>
                      {qty}
                    </Animated.Text>
                    <Pressable onPress={inc} hitSlop={8} style={styles.stepBtn}>
                      <PlusIcon size={18} color={colors.creamText} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={inc} hitSlop={8} style={styles.addFab}>
                    <PlusIcon size={24} color={colors.creamText} />
                  </Pressable>
                )}
              </Animated.View>
            </View>
          </GlassCard>
        </Pressable>
      </Animated.View>
    );
  },
);
ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  item: {
    width: CARD_WIDTH,
    marginRight: metrics.cardGap,
  },
  pressFill: {
    flex: 1,
  },
  cardFill: {
    flex: 1,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // gap = separación mínima entre bloques aunque la pantalla sea baja;
    // el paddingBottom evita que el botón pegue con el borde de la tarjeta.
    gap: 10,
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  stepperWrap: {
    marginTop: 6,
  },
  titleBlock: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    ...typography.cardTitle,
    fontSize: 25,
    lineHeight: 31,
    textAlign: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  imageShadow: {
    shadowColor: '#1E2740',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
  },
  priceText: {
    color: colors.primary,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 12,
    gap: 10,
    backgroundColor: colors.primary,
    shadowColor: colors.burgundyDark,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  stepBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    color: colors.creamText,
    fontSize: 17,
    minWidth: 18,
    textAlign: 'center',
    fontWeight: '700',
  },
  addFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: colors.burgundyDark,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
});
