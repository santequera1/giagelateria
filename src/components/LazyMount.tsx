import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';

export interface LazyMountProps {
  children: React.ReactNode;
  /** Tamaño reservado mientras el contenido no se monta (evita saltos). */
  placeholderStyle: StyleProp<ViewStyle>;
  /** Distancia (px) antes de entrar al viewport a la que se monta. */
  rootMargin?: number;
}

/**
 * Monta sus hijos solo cuando el contenedor se acerca al viewport (web,
 * IntersectionObserver). Evita que los embeds pesados (Instagram, Google
 * Maps) compitan con la carga inicial de la página — en Safari eso
 * congelaba la carga y a veces Instagram rechazaba las peticiones en
 * ráfaga. En nativo monta de inmediato.
 */
export const LazyMount: React.FC<LazyMountProps> = ({
  children,
  placeholderStyle,
  rootMargin = 600,
}) => {
  const [visible, setVisible] = useState(Platform.OS !== 'web');
  const ref = useRef<View>(null);

  useEffect(() => {
    if (visible) return;
    const IO = (globalThis as { IntersectionObserver?: typeof IntersectionObserver })
      .IntersectionObserver;
    const node = ref.current as unknown as Element | null;
    if (!IO || !node) {
      // Sin observer: montar tras un respiro para no bloquear la carga.
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
    const obs = new IO(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: `${rootMargin}px` },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [visible, rootMargin]);

  return (
    <View ref={ref} style={visible ? undefined : placeholderStyle}>
      {visible ? children : null}
    </View>
  );
};
