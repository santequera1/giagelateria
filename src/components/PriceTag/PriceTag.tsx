import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { metrics } from '../../theme/metrics';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/format';

export type PriceTagVariant = 'plain' | 'cream' | 'light' | 'gold';

export interface PriceTagProps {
  value: number;
  /**
   * plain = bare bold text (home card "$ 15.000"),
   * cream = cream pill (detail),
   * light = pill claro (cart row).
   */
  variant?: PriceTagVariant;
  /** Prefijo opcional, p. ej. "Desde ". */
  prefix?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/** Pill with formatted price (SPEC §5). */
export const PriceTag: React.FC<PriceTagProps> = React.memo(
  ({ value, variant = 'plain', prefix = '', style, textStyle }) => {
    if (variant === 'plain') {
      return (
        <Text style={[typography.cardPrice, textStyle]}>
          {`${prefix}${formatPrice(value, { space: true })}`}
        </Text>
      );
    }
    const isCream = variant === 'cream';
    const pillStyle =
      variant === 'gold' ? styles.gold : isCream ? styles.cream : styles.light;
    return (
      <View style={[styles.pill, pillStyle, style]}>
        <Text style={[isCream ? typography.pricePill : typography.cartRowPrice, textStyle]}>
          {`${prefix}${formatPrice(value)}`}
        </Text>
      </View>
    );
  },
);
PriceTag.displayName = 'PriceTag';

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  cream: {
    height: metrics.pricePillHeight,
    borderRadius: metrics.pricePillHeight / 2,
    paddingHorizontal: metrics.pricePillPaddingH,
    backgroundColor: colors.cream,
  },
  light: {
    height: metrics.rowPricePillHeight,
    borderRadius: metrics.rowPricePillHeight / 2,
    paddingHorizontal: 16,
    backgroundColor: colors.chipActiveBg,
  },
  /** Píldora dorada GIA — resalta el precio en la tarjeta del home. */
  gold: {
    height: metrics.rowPricePillHeight,
    borderRadius: metrics.rowPricePillHeight / 2,
    paddingHorizontal: 16,
    backgroundColor: colors.gold,
  },
});
