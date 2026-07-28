import React, { useCallback, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebFrame } from './WebFrame';
import { colors } from '../theme/colors';

export interface InstagramCardProps {
  /** Ruta del post, p. ej. "p/DO3tLdiDn5X" o "reel/DZ5bkHHJ2Yd". */
  post: string;
  /** Miniatura local (webp empaquetado — sin depender del CDN de IG). */
  thumb: ImageSourcePropType;
  width: number;
  height: number;
}

/**
 * Vista previa liviana de una publicación de Instagram: muestra la
 * miniatura local (unos KB) y solo carga el embed real (~1MB de scripts de
 * Instagram) cuando el usuario la toca. En nativo abre la publicación en
 * la app de Instagram.
 */
export const InstagramCard: React.FC<InstagramCardProps> = React.memo(
  ({ post, thumb, width, height }) => {
    const [embedLoaded, setEmbedLoaded] = useState(false);

    const onPress = useCallback(() => {
      if (Platform.OS === 'web') {
        setEmbedLoaded(true);
      } else {
        Linking.openURL(`https://www.instagram.com/${post}/`);
      }
    }, [post]);

    if (embedLoaded) {
      return (
        <WebFrame
          src={`https://www.instagram.com/${post}/embed/captioned/`}
          title={`Instagram — ${post}`}
          height={Math.max(height, 480)}
          width={width}
        />
      );
    }

    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, { width, height }, pressed && styles.pressed]}
      >
        <Image source={thumb} style={[styles.thumb, { width, height }]} resizeMode="cover" />
        <View style={styles.footer}>
          <Text style={styles.handle}>@giagelateria</Text>
          <Text style={styles.cta}>Toca para ver la publicación</Text>
        </View>
      </Pressable>
    );
  },
);
InstagramCard.displayName = 'InstagramCard';

/** Altura de la franja inferior "@giagelateria". */
const FOOTER_H = 54;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
  },
  pressed: {
    opacity: 0.92,
  },
  thumb: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FOOTER_H,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(52,66,104,0.92)',
  },
  handle: {
    color: colors.creamText,
    fontSize: 14,
    fontWeight: '700',
  },
  cta: {
    color: 'rgba(254,243,222,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
});
