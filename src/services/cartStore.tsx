import React, { createContext, use, useCallback, useEffect, useMemo, useReducer } from 'react';
import { CartLine } from '../types';
import { GelatoSize, PRODUCTS, Product, productById, sizeById } from '../constants/products';

/**
 * Cart store — React Context + reducer.
 * Cada línea es un sabor en un tamaño (productId + sizeId + segundo sabor
 * opcional para Grande/Litro). El precio sale del tamaño. El carrito se
 * persiste en localStorage (web); el pedido se envía por WhatsApp.
 */

export interface CartState {
  items: CartLine[];
}

interface LineKey {
  productId: string;
  sizeId: string;
  secondProductId?: string;
}

export type CartAction =
  | ({ type: 'add'; qty?: number } & LineKey)
  | ({ type: 'remove' } & LineKey)
  | ({ type: 'setQty'; qty: number } & LineKey)
  | { type: 'clear' };

export const DELIVERY_CHARGE = 0;

/* ----------------------------------------------------------------------- */
/* Persistencia (localStorage en web; en nativo el carrito vive en memoria) */
/* ----------------------------------------------------------------------- */

const STORAGE_KEY = 'gia-cart-v1';

const getStorage = (): Storage | null => {
  try {
    const g = globalThis as { localStorage?: Storage };
    return g.localStorage ?? null;
  } catch {
    return null;
  }
};

const isValidLine = (l: unknown): l is CartLine => {
  if (typeof l !== 'object' || l === null) return false;
  const line = l as Partial<CartLine>;
  return (
    typeof line.productId === 'string' &&
    typeof line.sizeId === 'string' &&
    typeof line.qty === 'number' &&
    PRODUCTS.some((p) => p.id === line.productId)
  );
};

const loadPersistedItems = (): CartLine[] => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidLine);
  } catch {
    return [];
  }
};

const persistItems = (items: CartLine[]): void => {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage lleno o bloqueado — el carrito sigue funcionando en memoria
  }
};

/* ----------------------------------------------------------------------- */

const clampQty = (qty: number): number => Math.max(0, Math.min(99, Math.round(qty)));

const sameLine = (line: CartLine, key: LineKey): boolean =>
  line.productId === key.productId &&
  line.sizeId === key.sizeId &&
  (line.secondProductId ?? null) === (key.secondProductId ?? null);

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'add': {
      const qty = clampQty(action.qty ?? 1);
      if (qty <= 0) return state;
      const existing = state.items.find((i) => sameLine(i, action));
      if (existing) {
        return {
          items: state.items.map((i) =>
            sameLine(i, action) ? { ...i, qty: clampQty(i.qty + qty) } : i,
          ),
        };
      }
      const line: CartLine = {
        productId: action.productId,
        sizeId: action.sizeId,
        qty,
        ...(action.secondProductId ? { secondProductId: action.secondProductId } : {}),
      };
      return { items: [...state.items, line] };
    }
    case 'remove':
      return { items: state.items.filter((i) => !sameLine(i, action)) };
    case 'setQty': {
      const qty = clampQty(action.qty);
      if (qty <= 0) {
        return { items: state.items.filter((i) => !sameLine(i, action)) };
      }
      return {
        items: state.items.map((i) => (sameLine(i, action) ? { ...i, qty } : i)),
      };
    }
    case 'clear':
      return { items: [] };
    default:
      return state;
  }
};

export interface CartContextValue extends CartState {
  add: (productId: string, sizeId: string, qty?: number, secondProductId?: string) => void;
  remove: (productId: string, sizeId: string, secondProductId?: string) => void;
  setQty: (productId: string, sizeId: string, qty: number, secondProductId?: string) => void;
  clear: () => void;
  /** Derived selectors. */
  totalCount: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, () => ({
    items: loadPersistedItems(),
  }));

  useEffect(() => {
    persistItems(state.items);
  }, [state.items]);

  const add = useCallback(
    (productId: string, sizeId: string, qty?: number, secondProductId?: string) => {
      dispatch({ type: 'add', productId, sizeId, qty, secondProductId });
    },
    [],
  );
  const remove = useCallback(
    (productId: string, sizeId: string, secondProductId?: string) =>
      dispatch({ type: 'remove', productId, sizeId, secondProductId }),
    [],
  );
  const setQty = useCallback(
    (productId: string, sizeId: string, qty: number, secondProductId?: string) =>
      dispatch({ type: 'setQty', productId, sizeId, qty, secondProductId }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  const value = useMemo<CartContextValue>(() => {
    const totalCount = state.items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = state.items.reduce((sum, i) => sum + sizeById(i.sizeId).price * i.qty, 0);
    const deliveryCharge = 0;
    return {
      ...state,
      add,
      remove,
      setQty,
      clear,
      totalCount,
      subtotal,
      deliveryCharge,
      total: subtotal + deliveryCharge,
    };
  }, [state, add, remove, setQty, clear]);

  return <CartContext value={value}>{children}</CartContext>;
};

export const useCartStore = (): CartContextValue => {
  const ctx = use(CartContext);
  if (!ctx) {
    throw new Error('useCartStore must be used within a CartProvider');
  }
  return ctx;
};

/** Unique product ids currently in the cart (order preserved). */
export const useCartProductIds = (): string[] =>
  useCartStore().items.map((i) => i.productId);

/** Cart lines joined with full product + size data. */
export interface EnrichedCartLine extends CartLine {
  product: Product;
  secondProduct?: Product;
  size: GelatoSize;
  lineTotal: number;
  /** "Pistacho" o "Pistacho + Maracuyá". */
  displayName: string;
}

export const useCartLines = (): EnrichedCartLine[] => {
  const { items } = useCartStore();
  return useMemo(
    () =>
      items.map((i) => {
        const product = productById(i.productId);
        const secondProduct = i.secondProductId ? productById(i.secondProductId) : undefined;
        const size = sizeById(i.sizeId);
        return {
          ...i,
          product,
          secondProduct,
          size,
          lineTotal: size.price * i.qty,
          displayName: secondProduct ? `${product.name} + ${secondProduct.name}` : product.name,
        };
      }),
    [items],
  );
};
