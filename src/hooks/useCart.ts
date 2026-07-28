import { useCartStore } from '../services/cartStore';

/**
 * Public cart hook (SPEC §7) — thin re-export of the store context so
 * screens never depend on the store file directly.
 */
export const useCart = useCartStore;
