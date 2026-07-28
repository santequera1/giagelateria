/**
 * Formato de moneda — pesos colombianos (COP), sin decimales,
 * separador de miles con punto: "$ 12.000".
 */

export interface FormatPriceOptions {
  /** Espacio después del símbolo: "$ 12.000" (estilo tarjeta del home). */
  space?: boolean;
}

/** Agrupa miles con punto: 12000 -> "12.000". */
const groupThousands = (value: number): string =>
  Math.round(Math.abs(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** "$12.000" / "$ 12.000" */
export const formatPrice = (value: number, options: FormatPriceOptions = {}): string => {
  const { space = false } = options;
  return `$${space ? ' ' : ''}${groupThousands(value)}`;
};

/** "COP 38.000" (total del carrito). */
export const formatCOP = (value: number): string => `COP ${groupThousands(value)}`;

/** Zero-padded quantity: 2 -> "02". */
export const formatQty = (qty: number): string => String(Math.max(0, Math.round(qty))).padStart(2, '0');
