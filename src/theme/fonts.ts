import { TextStyle } from 'react-native';

/**
 * Familias tipográficas de la marca GIA:
 * - Lapture (jaf-lapture, la serif del sitio) — cuerpo y UI.
 * - Playfair Display — serif display de alto contraste para títulos
 *   (reemplazo libre de "The Seasons" del sitio).
 * - Great Vibes — script cursiva de acento (como el "Gelatería" del logo).
 * Cada peso es una familia propia (cargadas en app/_layout.tsx con expo-font),
 * por eso no se usa fontWeight.
 */
export const families = {
  /** Lapture regular — párrafos y textos de UI. */
  body: 'Lapture-Regular',
  /** Lapture semibold — énfasis, botones, etiquetas. */
  bodySemibold: 'Lapture-Semibold',
  /** Playfair semibold — títulos medianos. */
  display: 'PlayfairDisplay-SemiBold',
  /** Playfair bold — títulos grandes, precios destacados. */
  displayBold: 'PlayfairDisplay-Bold',
  /** Playfair italic — subtítulos elegantes. */
  displayItalic: 'PlayfairDisplay-Italic',
  /** Great Vibes — palabra de acento cursiva. */
  script: 'GreatVibes-Regular',
} as const;

export type FontFamilyToken = keyof typeof families;

/** Compose a text style for a brand family. */
export const font = (family: FontFamilyToken): Pick<TextStyle, 'fontFamily'> => ({
  fontFamily: families[family],
});
