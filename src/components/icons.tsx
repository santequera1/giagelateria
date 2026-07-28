import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

/**
 * Inline SVG icon set (SPEC §5) — stroke 2, currentColor-style via `color` prop.
 * All icons are drawn on a 24x24 grid with round caps/joins.
 */
export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const IconBase: React.FC<IconProps & { children: React.ReactNode; viewBox?: string }> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
  children,
  viewBox = '0 0 24 24',
}) => (
  <Svg width={size} height={size} viewBox={viewBox} fill="none">
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            stroke: color,
            strokeWidth,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          })
        : child,
    )}
  </Svg>
);

/** Basket / cart used on FABs and bars. */
export const CartIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M5.5 9h13l-1.2 9.6a2 2 0 0 1-2 1.8H8.7a2 2 0 0 1-2-1.8L5.5 9z" />
    <Path d="M9 9V7a3 3 0 0 1 6 0v2" />
    <Path d="M10 13v4" />
    <Path d="M14 13v4" />
  </IconBase>
);

export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M4 12h16" />
    <Path d="M13 5l7 7-7 7" />
  </IconBase>
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M15 5l-7 7 7 7" />
  </IconBase>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M9 5l7 7-7 7" />
  </IconBase>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M12 5v14" />
    <Path d="M5 12h14" />
  </IconBase>
);

export const MinusIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M5 12h14" />
  </IconBase>
);

export const IceCreamConeIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M7.5 10a4.5 4.5 0 0 1 9 0" />
    <Path d="M7.5 10h9L12 21l-4.5-11z" />
  </IconBase>
);

export const PopsicleIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M8 8a4 4 0 0 1 8 0v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V8z" />
    <Path d="M12 16v5" />
  </IconBase>
);

export const CandyIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Circle cx={12} cy={12} r={4} />
    <Path d="M8.2 9.5L4 7v10l4.2-2.5" />
    <Path d="M15.8 9.5L20 7v10l-4.2-2.5" />
  </IconBase>
);

/** Triple chevron "›››" for the Make Payment circle. */
export const ChevronsRightIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M4.5 6.5L9.5 12l-5 5.5" />
    <Path d="M9.75 6.5L14.75 12l-5 5.5" />
    <Path d="M15 6.5L20 12l-5 5.5" />
  </IconBase>
);

/** Cuadrícula 2x2 — alterna a vista de lista de tarjetas. */
export const GridIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M4 4h6.5v6.5H4z" />
    <Path d="M13.5 4H20v6.5h-6.5z" />
    <Path d="M4 13.5h6.5V20H4z" />
    <Path d="M13.5 13.5H20V20h-6.5z" />
  </IconBase>
);

/** Tarjeta central con laterales — alterna a vista carrusel. */
export const CarouselIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M7.5 5h9v14h-9z" />
    <Path d="M3.5 8.5v7" />
    <Path d="M20.5 8.5v7" />
  </IconBase>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M6 6l12 12" />
    <Path d="M18 6L6 18" />
  </IconBase>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <Path d="M4 7h16" />
    <Path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
    <Path d="M6.5 7l1 12a2 2 0 0 0 2 1.8h5a2 2 0 0 0 2-1.8l1-12" />
  </IconBase>
);
