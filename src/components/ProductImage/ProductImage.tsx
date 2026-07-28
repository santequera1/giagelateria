import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useFloatingLoop } from '../../animations/useFloatingLoop';

export interface ProductImageProps {
  source: ImageSourcePropType;
  /** Square size of the image box. */
  size: number;
  /** Constant base rotation in deg (home card uses +18). */
  baseRotation?: number;
  /** External animated/static style applied to the outer wrapper (parallax, liquid drag). */
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
  /** Extra style for the inner floating image (e.g. drop shadow). */
  imageStyle?: StyleProp<ImageStyle>;
  /** Disable the floating loop. */
  floating?: boolean;
}

/**
 * Memoized product image with a continuous Reanimated floating/breathing
 * loop (SPEC §5). The loop runs on the inner view so external animated
 * transforms on the wrapper compose cleanly on top.
 */
export const ProductImage: React.FC<ProductImageProps> = React.memo(
  ({ source, size, baseRotation = 0, style, imageStyle, floating = true }) => {
    const loopStyle = useFloatingLoop({ baseRotation, enabled: floating });
    return (
      <Animated.View style={[{ width: size, height: size }, style]}>
        <Animated.View style={[StyleSheet.absoluteFill, loopStyle]}>
          <Image
            source={source}
            style={[{ width: size, height: size }, imageStyle]}
            resizeMode="contain"
            fadeDuration={0}
          />
        </Animated.View>
      </Animated.View>
    );
  },
);
ProductImage.displayName = 'ProductImage';
