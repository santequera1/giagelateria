import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Spacing / radius / metrics tokens (SPEC §2 + §6).
 */
export const metrics = {
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  /** Horizontal screen padding. */
  paddingHome: 28,
  paddingDetail: 24,
  paddingCart: 24,

  /** Radii. */
  radiusCard: 36,
  radiusChip: 24,
  radiusSummary: 32,
  radiusCartContainer: 44,
  radiusBar: 36,

  /** Chips. */
  chipHeight: 48,
  chipIconSize: 52,

  /** Featured product card (home). */
  cardHeight: Math.min(560, Math.round(SCREEN_HEIGHT * 0.62)),
  cardGap: 20,
  cardPeek: 36,
  fabSize: 64,

  /** Arrow button next to "Flavor of the week". */
  arrowButton: 40,

  /** Detail screen. */
  qtyButton: 56,
  pricePillHeight: 40,
  pricePillPaddingH: 24,
  addToCartHeight: 72,
  addToCartCircle: 56,
  backButton: 44,

  /** Cart screen. */
  cartThumb: 72,
  rowGap: 20,
  badgeSize: 40,
  rowPricePillHeight: 36,
  makePaymentHeight: 76,
  makePaymentCircle: 60,

  /** Mini cart bar (home). */
  miniCartHeight: 96,
  miniCartThumb: 44,
  miniCartThumbOverlap: -12,
  handleWidth: 32,
  handleHeight: 4,

  /** Avatar. */
  avatarSize: 56,
} as const;

/** Width of a featured card so the next card peeks in from the right. */
export const CARD_WIDTH =
  SCREEN_WIDTH - metrics.paddingHome * 2 - metrics.cardPeek;
/** Carousel snap interval: card + gap. */
export const SNAP_INTERVAL = CARD_WIDTH + metrics.cardGap;
