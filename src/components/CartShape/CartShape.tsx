import React, { useId, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '../../theme/colors';

export interface CartShapeProps {
  width: number;
  height: number;
  /** Depth of the concave center notch. Default 10. */
  notchDepth?: number;
  /** Width of the concave center notch. Default 90. */
  notchWidth?: number;
  /** Corner radius. Default 36. */
  cornerRadius?: number;
  /** Gentle S-curve across the top edge. Default true. */
  wave?: boolean;
  /** Mirror the notched wave on the bottom edge (summary card). Default false. */
  bottomNotch?: boolean;
  /**
   * Square bottom corners — the side edges run straight into the bottom
   * edge so the shape bleeds flush into the screen bottom (cart screen
   * container, MiniCartBar). Default false.
   */
  squareBottom?: boolean;
  /** Draw a 1px horizontal divider at dividerY. */
  divider?: boolean;
  dividerY?: number;
  /** Solid fill. */
  fill?: string;
  /** Vertical gradient fill (top -> bottom). Overrides `fill`. */
  colors?: readonly string[];
  /** Absolutely positioned content overlay. */
  children?: React.ReactNode;
}

const round = (n: number): number => Math.round(n * 100) / 100;

/**
 * The signature container silhouette (SPEC §4): rounded corners + wavy top
 * edge with a shallow concave notch at center, optional mirrored bottom
 * edge, optional thin divider line. Reused by MiniCartBar, the Cart screen
 * burgundy container and the cart summary card.
 *
 * Path is built with M/L/Q/C and memoized per geometry.
 */
export const CartShape: React.FC<CartShapeProps> = React.memo(
  ({
    width,
    height,
    notchDepth = 10,
    notchWidth = 90,
    cornerRadius = 36,
    wave = true,
    bottomNotch = false,
    squareBottom = false,
    divider = false,
    dividerY,
    fill = colors.burgundy,
    colors: gradientColors,
    children,
  }) => {
    const rawId = useId();
    const gradientId = useMemo(() => `cs${rawId.replace(/[^a-zA-Z0-9]/g, '')}`, [rawId]);

    const path = useMemo(() => {
      const w = width;
      const h = height;
      if (w <= 0 || h <= 0) return '';
      const r = Math.min(cornerRadius, w / 2, h / 2);
      const amp = wave ? 5 : 0;
      const ty = amp + 2; // top edge baseline (wave rises to y=2)
      const by = bottomNotch ? amp + 2 : 0; // bottom edge baseline offset
      const cx = w / 2;
      const nh = Math.min(notchWidth / 2, w * 0.22); // notch half-width
      const nd = Math.min(notchDepth, h * 0.2);
      const cp = nh * 0.42; // notch control-point inset (smooth U dip)
      const sh = 28; // shoulder run between wave crest and notch

      const d: string[] = [];
      d.push(`M 0 ${round(r + ty)}`);
      d.push(`Q 0 ${round(ty)} ${round(r)} ${round(ty)}`); // top-left corner
      // Top edge: gentle wave rising toward the notch shoulders.
      d.push(
        `C ${round(w * 0.24)} ${round(ty - amp)} ${round(cx - nh - sh)} ${round(
          ty - amp,
        )} ${round(cx - nh)} ${round(ty)}`,
      );
      // Concave center notch (dip down).
      d.push(
        `C ${round(cx - nh + cp)} ${round(ty + nd * 1.4)} ${round(cx + nh - cp)} ${round(
          ty + nd * 1.4,
        )} ${round(cx + nh)} ${round(ty)}`,
      );
      // Mirror wave to the right corner.
      d.push(
        `C ${round(cx + nh + sh)} ${round(ty - amp)} ${round(w * 0.76)} ${round(
          ty - amp,
        )} ${round(w - r)} ${round(ty)}`,
      );
      d.push(`Q ${round(w)} ${round(ty)} ${round(w)} ${round(r + ty)}`); // top-right corner

      if (squareBottom) {
        // Square bottom corners: sides run straight into the bottom edge.
        d.push(`L ${round(w)} ${round(h)}`); // right edge
        d.push(`L 0 ${round(h)}`); // bottom edge
      } else {
        d.push(`L ${round(w)} ${round(h - by - r)}`); // right edge
        d.push(`Q ${round(w)} ${round(h - by)} ${round(w - r)} ${round(h - by)}`); // bottom-right corner

        if (bottomNotch) {
          // Mirrored wave + notch, travelling right -> left along the bottom.
          d.push(
            `C ${round(w * 0.76)} ${round(h - by + amp)} ${round(cx + nh + sh)} ${round(
              h - by + amp,
            )} ${round(cx + nh)} ${round(h - by)}`,
          );
          d.push(
            `C ${round(cx + nh - cp)} ${round(h - by - nd * 1.4)} ${round(cx - nh + cp)} ${round(
              h - by - nd * 1.4,
            )} ${round(cx - nh)} ${round(h - by)}`,
          );
          d.push(
            `C ${round(cx - nh - sh)} ${round(h - by + amp)} ${round(w * 0.24)} ${round(
              h - by + amp,
            )} ${round(r)} ${round(h - by)}`,
          );
        } else {
          d.push(`L ${round(r)} ${round(h - by)}`);
        }
        d.push(`Q 0 ${round(h - by)} 0 ${round(h - by - r)}`); // bottom-left corner
      }
      d.push(`L 0 ${round(r + ty)}`); // left edge
      d.push('Z');
      return d.join(' ');
    }, [width, height, cornerRadius, wave, bottomNotch, squareBottom, notchDepth, notchWidth]);

    const dividerPath = useMemo(() => {
      if (!divider || dividerY == null || width <= 0) return '';
      const pad = 24;
      return `M ${pad} ${round(dividerY)} L ${round(width - pad)} ${round(dividerY)}`;
    }, [divider, dividerY, width]);

    const fillRef = gradientColors && gradientColors.length >= 2 ? `url(#${gradientId})` : fill;

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {path !== '' && (
          <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
            {gradientColors && gradientColors.length >= 2 && (
              <Defs>
                <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  {gradientColors.map((c, i) => (
                    <Stop
                      key={`${c}-${i}`}
                      offset={i / (gradientColors.length - 1)}
                      stopColor={c}
                    />
                  ))}
                </LinearGradient>
              </Defs>
            )}
            <Path d={path} fill={fillRef} />
            {dividerPath !== '' && (
              <Path d={dividerPath} stroke={colors.dividerDark} strokeWidth={1} />
            )}
          </Svg>
        )}
        {children != null && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {children}
          </View>
        )}
      </View>
    );
  },
);
CartShape.displayName = 'CartShape';
