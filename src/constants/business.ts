/**
 * Datos del negocio — Gia Gelatería (giagelateria.com).
 */
export const BUSINESS = {
  name: 'Gia Gelatería',
  address: 'Calle Baloco #2-22, Cartagena, Colombia',
  whatsappPhone: '573007856068',
  whatsappDisplay: '300 785 6068',
  instagramUrl: 'https://www.instagram.com/giagelateria/',
  instagramHandle: '@giagelateria',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61575811243564',
  mapsUrl: 'https://maps.app.goo.gl/68MaxBkhQ5aXu9AY7',
  rappiUrl: 'https://www.rappi.com.co/restaurantes/900466621-gia-gelateria',
} as const;

/** Enlace de WhatsApp con mensaje pre-cargado. */
export const whatsappUrl = (text: string): string =>
  `https://api.whatsapp.com/send/?phone=${BUSINESS.whatsappPhone}&text=${encodeURIComponent(
    text,
  )}&type=phone_number&app_absent=0`;
