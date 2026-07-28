import { StyleSheet, TextStyle } from 'react-native';
import { colors } from './colors';
import { font } from './fonts';

/**
 * Typography scale — marca GIA.
 * Títulos en Playfair Display (serif display), cuerpo en Lapture y el
 * acento cursivo en Great Vibes. Every style bundles family, size,
 * line-height and color so call-sites stay declarative.
 */
export const typography = StyleSheet.create({
  /** "Auténtico Gelato / artesanal" — serif + acento script. */
  greeting: {
    ...font('display'),
    fontSize: 28,
    lineHeight: 42,
    color: colors.text,
  } as TextStyle,
  /** La palabra "Gelato" en cursiva, más grande (la script lee pequeña). */
  greetingBold: {
    ...font('script'),
    fontSize: 42,
    lineHeight: 46,
    color: colors.text,
  } as TextStyle,

  /** "Sabores de temporada" — Lapture semibold. */
  sectionTitle: {
    ...font('bodySemibold'),
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  } as TextStyle,

  /** Product name on home card — Playfair bold, two lines. */
  cardTitle: { ...font('displayBold'), fontSize: 31, lineHeight: 37, color: colors.text } as TextStyle,
  /** Subtitle pill text — Playfair italic. */
  cardSubtitle: {
    ...font('displayItalic'),
    fontSize: 14,
    lineHeight: 18,
    color: colors.text,
  } as TextStyle,
  /** Price on card ("Desde $ 15.000") — Lapture semibold. */
  cardPrice: { ...font('bodySemibold'), fontSize: 17, lineHeight: 23, color: colors.text } as TextStyle,

  /** Detail header title — Playfair semibold, centered. */
  detailTitle: { ...font('display'), fontSize: 22, lineHeight: 28, color: colors.text } as TextStyle,
  /** Quantity ("02") — Playfair bold. */
  quantity: { ...font('displayBold'), fontSize: 42, lineHeight: 50, color: colors.text } as TextStyle,
  /** Detail price pill — Lapture semibold on cream. */
  pricePill: { ...font('bodySemibold'), fontSize: 18, lineHeight: 24, color: colors.text } as TextStyle,
  /** "Agregar al carrito" — Lapture semibold, crema GIA sobre azul. */
  addToCart: { ...font('bodySemibold'), fontSize: 17, lineHeight: 23, color: colors.creamText } as TextStyle,

  /** Cart header "Carrito" — Playfair bold. */
  cartHeader: { ...font('displayBold'), fontSize: 25, lineHeight: 31, color: colors.text } as TextStyle,
  /** Cream circle badge — Lapture semibold. */
  badge: { ...font('bodySemibold'), fontSize: 16, lineHeight: 20, color: colors.text } as TextStyle,
  /** Cart row name — Lapture semibold, white. */
  cartRowName: { ...font('bodySemibold'), fontSize: 17, lineHeight: 22, color: colors.white } as TextStyle,
  /** Cart row subtitle — Lapture, muted on dark. */
  cartRowSubtitle: {
    ...font('body'),
    fontSize: 13,
    lineHeight: 18,
    color: colors.onDarkMuted,
  } as TextStyle,
  /** Cart row price pill — Lapture semibold. */
  cartRowPrice: { ...font('bodySemibold'), fontSize: 15, lineHeight: 20, color: colors.text } as TextStyle,

  /** Summary labels / values — Lapture. */
  summaryLabel: { ...font('body'), fontSize: 15, lineHeight: 21, color: colors.text } as TextStyle,
  summaryValue: { ...font('bodySemibold'), fontSize: 14, lineHeight: 20, color: colors.text } as TextStyle,
  /** "COP 38.000" — Playfair bold. */
  summaryTotal: { ...font('displayBold'), fontSize: 24, lineHeight: 30, color: colors.text } as TextStyle,
  /** "Pedir por WhatsApp" — Lapture semibold. */
  makePayment: { ...font('bodySemibold'), fontSize: 17, lineHeight: 23, color: colors.text } as TextStyle,

  /** Mini cart: "Carrito" / "2 productos". */
  miniCartTitle: { ...font('bodySemibold'), fontSize: 17, lineHeight: 22, color: colors.white } as TextStyle,
  miniCartSubtitle: {
    ...font('body'),
    fontSize: 13,
    lineHeight: 18,
    color: colors.onDarkFaint,
  } as TextStyle,

  /** Category chip label — Lapture semibold. */
  chip: { ...font('bodySemibold'), fontSize: 15, lineHeight: 20, color: colors.text } as TextStyle,
  /** Small muted label — Lapture. */
  caption: { ...font('body'), fontSize: 13, lineHeight: 18, color: colors.textMuted } as TextStyle,
});

export type TypographyToken = keyof typeof typography;
