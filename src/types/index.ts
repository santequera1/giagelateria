/**
 * Shared app-wide types.
 */

/** One line in the cart — un sabor en un tamaño (con segundo sabor opcional). */
export interface CartLine {
  productId: string;
  sizeId: string;
  qty: number;
  /** Segundo sabor para tamaños de dos sabores (Grande / Litro). */
  secondProductId?: string;
}
