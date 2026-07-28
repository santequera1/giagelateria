import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../theme/colors';
import { metrics } from '../../theme/metrics';

/**
 * En web NO usamos BlurView: el backdrop-filter que genera tiene un bug en
 * Safari (iOS) que difumina también el contenido de la tarjeta, no solo el
 * fondo. El vidrio se simula con capas translúcidas planas, que se ven
 * idénticas sobre el fondo crema. En nativo el blur real sí funciona.
 */
const IS_WEB = Platform.OS === 'web';

export interface GlassCardProps {
  style?: StyleProp<ViewStyle>;
  /** Optional layer painted above the glass gradient (e.g. animated flavor tint). */
  tintLayer?: React.ReactNode;
  /** Franja inferior más "esmerilada" (solo nativo usa blur real). */
  bottomBand?: boolean;
  children?: React.ReactNode;
}

/**
 * Tarjeta de vidrio crema: fondo translúcido + borde blanco 1px, radio 36 y
 * sombra suave. El contenido va en una capa con zIndex propio para quedar
 * siempre por encima de las capas decorativas.
 */
export const GlassCard: React.FC<GlassCardProps> = React.memo(
  ({ style, tintLayer, bottomBand = false, children }) => (
    <View style={[styles.shadow, style]}>
      <View style={styles.glass}>
        {!IS_WEB && <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />}
        <View style={[StyleSheet.absoluteFill, styles.glassTint]} />
        {tintLayer}
        {bottomBand && (
          <View pointerEvents="none" style={styles.bottomBand}>
            {!IS_WEB && <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />}
            <View style={[StyleSheet.absoluteFill, styles.bottomBandTint]} />
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  ),
);
GlassCard.displayName = 'GlassCard';

const styles = StyleSheet.create({
  shadow: {
    borderRadius: metrics.radiusCard,
    shadowColor: colors.glassShadow,
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  glass: {
    flex: 1,
    borderRadius: metrics.radiusCard,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  glassTint: {
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  bottomBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    overflow: 'hidden',
    zIndex: 2,
  },
  bottomBandTint: {
    backgroundColor: 'rgba(254,243,222,0.75)',
  },
  content: {
    flex: 1,
    zIndex: 3,
  },
});
