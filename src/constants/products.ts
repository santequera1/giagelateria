import { ImageSourcePropType } from 'react-native';

/**
 * Catálogo de sabores — Gia Gelatería.
 * Fotos reales del local (vaso azul GIA, fondo de estudio).
 * El precio no es por sabor sino por tamaño (ver SIZES).
 */
/** Categorías para el filtro del home. */
export type ProductCategory = 'clasico' | 'frutal' | 'especial';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  /** Foto del gelato. */
  image: ImageSourcePropType;
  /** Tinte de tarjeta por sabor. */
  cardColors: { bg: string; accent: string };
}

/** Tamaños del menú (precios reales del local). */
export interface GelatoSize {
  id: string;
  label: string;
  description: string;
  /** Cuántos sabores incluye el tamaño. */
  flavors: 1 | 2;
  price: number;
}

export const SIZES: GelatoSize[] = [
  { id: 'pequeno', label: 'Pequeño', description: 'Un solo sabor', flavors: 1, price: 15000 },
  { id: 'grande', label: 'Grande', description: 'Dos sabores', flavors: 2, price: 21000 },
  { id: 'litro', label: 'Litro', description: 'Dos sabores', flavors: 2, price: 70000 },
];

export const DEFAULT_SIZE_ID = 'pequeno';
/** Precio del tamaño más pequeño — "Desde $15.000" en las tarjetas. */
export const BASE_PRICE = SIZES[0].price;

export const sizeById = (id: string): GelatoSize =>
  SIZES.find((s) => s.id === id) ?? SIZES[0];

export const PRODUCTS: Product[] = [
  {
    id: 'pistacho',
    category: 'clasico',
    name: 'Pistacho',
    subtitle: 'Auténtica pasta de pistacho',
    image: require('../assets/gia-flavors/pistacho.webp'),
    cardColors: { bg: '#E7EAD9', accent: '#7C8455' },
  },
  {
    id: 'chocolate',
    category: 'clasico',
    name: 'Chocolate',
    subtitle: 'Intenso y clásico',
    image: require('../assets/gia-flavors/chocolate.webp'),
    cardColors: { bg: '#EAD9CB', accent: '#6B4226' },
  },
  {
    id: 'avellana',
    category: 'clasico',
    name: 'Avellana',
    subtitle: 'Tostada y cremosa',
    image: require('../assets/gia-flavors/avellana.webp'),
    cardColors: { bg: '#EFE0D1', accent: '#8B5E3C' },
  },
  {
    id: 'vainilla',
    category: 'clasico',
    name: 'Vainilla',
    subtitle: 'Clásica y suave',
    image: require('../assets/gia-flavors/vainilla.webp'),
    cardColors: { bg: '#F7EED8', accent: '#C9A24B' },
  },
  {
    id: 'stracciatella',
    category: 'clasico',
    name: 'Stracciatella',
    subtitle: 'Crema y chispas de chocolate',
    image: require('../assets/gia-flavors/stracciatella.webp'),
    cardColors: { bg: '#F1EEE7', accent: '#4A4A4A' },
  },
  {
    id: 'milo',
    category: 'especial',
    name: 'Milo',
    subtitle: 'El favorito de casa',
    image: require('../assets/gia-flavors/milo.webp'),
    cardColors: { bg: '#EDDECC', accent: '#7A5230' },
  },
  {
    id: 'arroz-con-leche',
    category: 'especial',
    name: 'Arroz con Leche',
    subtitle: 'Sabor de la abuela',
    image: require('../assets/gia-flavors/arroz-con-leche.webp'),
    cardColors: { bg: '#F3EBDA', accent: '#B99B62' },
  },
  {
    id: 'coco-almendra',
    category: 'especial',
    name: 'Coco y Almendra',
    subtitle: 'Cremoso y crocante',
    image: require('../assets/gia-flavors/coco-almendra.webp'),
    cardColors: { bg: '#F4F0E6', accent: '#A48B5F' },
  },
  {
    id: 'corozo',
    category: 'frutal',
    name: 'Corozo',
    subtitle: 'Fruto auténtico del Caribe',
    image: require('../assets/gia-flavors/corozo.webp'),
    cardColors: { bg: '#F7D9DE', accent: '#B03A5B' },
  },
  {
    id: 'maracuya',
    category: 'frutal',
    name: 'Maracuyá',
    subtitle: 'Cítrico y refrescante',
    image: require('../assets/gia-flavors/maracuya.webp'),
    cardColors: { bg: '#FBEFCF', accent: '#D9A220' },
  },
  {
    id: 'maracuya-corozo',
    category: 'frutal',
    name: 'Maracuyá y Corozo',
    subtitle: 'Dúo caribeño',
    image: require('../assets/gia-flavors/maracuya-corozo.webp'),
    cardColors: { bg: '#FAE3D0', accent: '#C75B3F' },
  },
  {
    id: 'yogurt-amarenas',
    category: 'frutal',
    name: 'Yogurt con Amarenas',
    subtitle: 'Con cerezas amarena',
    image: require('../assets/gia-flavors/yogurt-amarenas.webp'),
    cardColors: { bg: '#F6DFE3', accent: '#A03B52' },
  },
];

/** Cono con marca GIA — ilustración del resumen del carrito. */
export const DESSERT_CUP_IMAGE: ImageSourcePropType = require('../assets/generated-products/gia-cono.webp');
/** Logo GIA — círculo del header. */
export const AVATAR_IMAGE: ImageSourcePropType = require('../assets/generated-products/gia-logo.png');

/** Tarjeta destacada del home. */
export const FEATURED_PRODUCT_ID = 'pistacho';
/** Sabor por defecto en la pantalla de detalle. */
export const DEFAULT_DETAIL_PRODUCT_ID = 'pistacho';

export const productById = (id: string): Product =>
  PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];

export const productIndexById = (id: string): number => {
  const idx = PRODUCTS.findIndex((p) => p.id === id);
  if (idx >= 0) return idx;
  const fallback = PRODUCTS.findIndex((p) => p.id === DEFAULT_DETAIL_PRODUCT_ID);
  return fallback >= 0 ? fallback : 0;
};
