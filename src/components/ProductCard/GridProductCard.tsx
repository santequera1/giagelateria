import React, { useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { BASE_PRICE, DEFAULT_SIZE_ID, Product } from '../../constants/products';
import { useCart } from '../../hooks/useCart';
import { useHaptics } from '../../hooks/useHaptics';
import { colors } from '../../theme/colors';
import { metrics } from '../../theme/metrics';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/format';
import { PlusIcon } from '../icons';

const GRID_GAP = 14;
export const GRID_CARD_WIDTH = Math.floor(
  (metrics.screen.width - metrics.paddingHome * 2 - GRID_GAP) / 2,
);

export interface GridProductCardProps {
  product: Product;
  index: number;
  onPress?: (product: Product) => void;
}

/**
 * Tarjeta compacta para la vista en cuadrícula (2 columnas): foto, nombre,
 * precio y botón "+" que agrega el tamaño Pequeño. El tinte de fondo es el
 * color pastel de cada sabor, en el estilo GIA.
 */
export const GridProductCard: React.FC<GridProductCardProps> = React.memo(
  ({ product, index, onPress }) => {
    const haptics = useHaptics();
    const { add, items } = useCart();

    const line = items.find(
      (i) => i.productId === product.id && i.sizeId === DEFAULT_SIZE_ID && !i.secondProductId,
    );
    const qty = line?.qty ?? 0;

    const onAdd = useCallback(() => {
      haptics.light();
      add(product.id, DEFAULT_SIZE_ID, 1);
    }, [haptics, add, product.id]);

    return (
      <Animated.View entering={FadeInUp.delay(Math.min(index, 6) * 60).duration(360)}>
        <Pressable
          onPress={() => onPress?.(product)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: product.cardColors.bg },
            pressed && styles.cardPressed,
          ]}
        >
          <Image source={product.image} style={styles.image} resizeMode="contain" fadeDuration={0} />
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.price}>{`Desde ${formatPrice(BASE_PRICE, { space: true })}`}</Text>

          <Pressable onPress={onAdd} hitSlop={8} style={styles.addBtn}>
            <PlusIcon size={18} color={colors.creamText} />
            {qty > 0 && (
              <Animated.View key={qty} entering={ZoomIn.duration(160)} style={styles.qtyBadge}>
                <Text style={styles.qtyBadgeText}>{qty}</Text>
              </Animated.View>
            )}
          </Pressable>
        </Pressable>
      </Animated.View>
    );
  },
);
GridProductCard.displayName = 'GridProductCard';

const styles = StyleSheet.create({
  card: {
    width: GRID_CARD_WIDTH,
    borderRadius: 24,
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: colors.glassShadow,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: GRID_CARD_WIDTH - 44,
    height: GRID_CARD_WIDTH - 44,
  },
  name: {
    ...typography.cardTitle,
    fontSize: 17,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: GRID_CARD_WIDTH - 24,
  },
  price: {
    ...typography.cardPrice,
    fontSize: 14,
    lineHeight: 20,
    color: colors.primary,
    marginTop: 2,
    marginBottom: 4,
  },
  addBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: colors.burgundyDark,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  qtyBadge: {
    position: 'absolute',
    top: -7,
    right: -7,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});
