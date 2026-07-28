/**
 * Design tokens — colors.
 * Paleta Gia Gelatería (menú y sitio): crema/beige, azul marino y oliva.
 * Los nombres de token se conservan del diseño original para no romper a
 * los consumidores ("burgundy" ahora es el azul marino primario de la marca).
 */
export const colors = {
  /** Fondo crema — base exacta del patrón GIA (#FEF3DE) para que las
      bandas con patrón se fundan sin bordes visibles. */
  backgroundGradient: ['#FEF3DE', '#FEF3DE', '#FEF3DE'] as const,
  /** Decorative soft blobs on the background. */
  blob: '#FFFFFF',

  /** Azul marino de títulos (H2 del sitio / menú). */
  text: '#364266',
  /** Café cálido de subtítulos (H3 del sitio). */
  textMuted: '#897863',

  /** Primario oscuro — contenedor del carrito / botón agregar (azul marino). */
  burgundy: '#364266',
  burgundyDark: '#242D49',
  /** Gradiente del primario oscuro. */
  burgundyGradient: ['#40507E', '#2A3453'] as const,

  /** Tarjeta principal del home — crema oliva translúcido. */
  cardPink: '#EFEDD8',
  cardPinkHighlight: '#FAF8EA',

  /** Oliva dorado del patrón GIA. */
  gold: '#C6BF81',
  /** Azul del botón principal (pedido del cliente: #344268). */
  primary: '#344268',
  /** Crema de texto sobre azul — base del patrón GIA (#FEF3DE). */
  creamText: '#FEF3DE',

  /** Category chips — oliva del patrón zigzag del menú. */
  chipActiveBg: '#E7E6CC',
  chipActiveBorder: '#C6BF81',
  /** Inactive chip — faint white pill / circle. */
  chipInactiveBg: 'rgba(255,255,255,0.55)',
  /** Ícono de chip inactivo — oliva GIA. */
  chipIconInactive: '#8F9053',

  /** Crema — píldora de precio, insignias, círculos internos. */
  cream: '#F5E6C0',
  creamDeep: '#EBD79E',

  /** Gradiente de la tarjeta resumen del carrito. */
  summaryGradient: ['#F7EFD9', '#EFE3C0'] as const,

  white: '#FFFFFF',

  /** Translucent helpers. */
  white70: 'rgba(255,255,255,0.7)',
  white60: 'rgba(255,255,255,0.6)',
  white12: 'rgba(255,255,255,0.12)',
  onDarkMuted: 'rgba(255,255,255,0.55)',
  onDarkFaint: 'rgba(255,255,255,0.6)',
  dividerDark: 'rgba(54,66,102,0.14)',

  /** Glass card border / shadow. */
  glassBorder: 'rgba(255,255,255,0.7)',
  glassShadow: '#8C8A62',

  /** Avatar circle backdrop. */
  avatarBg: '#EEEBD8',
} as const;

export type ColorToken = keyof typeof colors;
