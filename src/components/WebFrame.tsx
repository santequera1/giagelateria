import React from 'react';
import { Platform } from 'react-native';

export interface WebFrameProps {
  src: string;
  title: string;
  height: number;
  /** Ancho CSS; por defecto ocupa todo el contenedor. */
  width?: number | string;
  borderRadius?: number;
}

/**
 * Iframe embebido — solo web (en nativo no renderiza nada; los llamadores
 * muestran enlaces como alternativa). Se usa para el feed de Instagram y el
 * mapa de Google, que permiten embeberse sin API keys ni scripts externos.
 */
export const WebFrame: React.FC<WebFrameProps> = ({
  src,
  title,
  height,
  width = '100%',
  borderRadius = 24,
}) => {
  if (Platform.OS !== 'web') {
    return null;
  }
  return React.createElement('iframe', {
    src,
    title,
    loading: 'lazy',
    allowFullScreen: true,
    referrerPolicy: 'no-referrer-when-downgrade',
    style: {
      border: 0,
      width,
      height,
      borderRadius,
      backgroundColor: '#FFFFFF',
      display: 'block',
    },
  });
};
