import React, { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

export interface CreamDripProps {
  width: number;
  height?: number;
  /** Color de la crema (por defecto, la crema GIA). */
  color?: string;
  /** Cantidad de montículos. */
  bumps?: number;
  /** true = montículos hacia abajo (para bordes superiores). */
  flip?: boolean;
}

/**
 * Borde decorativo de "crema derretida": franja con montículos suaves,
 * usado para fundir las bandas con patrón GIA con el fondo crema.
 */
export const CreamDrip: React.FC<CreamDripProps> = ({
  width,
  height = 26,
  color = '#FEF3DE',
  bumps = 9,
  flip = false,
}) => {
  const d = useMemo(() => {
    const r = width / (bumps * 2);
    const base = height * 0.75;
    let path = `M0 ${height} L0 ${base}`;
    for (let i = 0; i < bumps; i++) {
      const x = i * 2 * r;
      path += ` C ${x + r * 0.7} 0, ${x + r * 1.3} 0, ${x + 2 * r} ${base}`;
    }
    path += ` L${width} ${height} Z`;
    return path;
  }, [width, height, bumps]);

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={flip ? { transform: [{ rotate: '180deg' }] } : undefined}
    >
      <Path d={d} fill={color} />
    </Svg>
  );
};
