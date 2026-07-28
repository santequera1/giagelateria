import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppBackground } from '../../components/AppBackground';
import { MiniCartBar } from '../../components/MiniCartBar';
import { RappiLogo } from '../../components/RappiLogo';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { GridProductCard } from '../../components/ProductCard/GridProductCard';
import { InstagramCard } from '../../components/InstagramCard';
import { CategoryChip } from '../../components/CategoryChip/CategoryChip';
import {
  ArrowRightIcon,
  CandyIcon,
  CarouselIcon,
  GridIcon,
  IceCreamConeIcon,
  PopsicleIcon,
} from '../../components/icons';
import {
  AVATAR_IMAGE,
  FEATURED_PRODUCT_ID,
  PRODUCTS,
  Product,
  SIZES,
  productIndexById,
} from '../../constants/products';
import { BUSINESS, whatsappUrl } from '../../constants/business';
import { useHaptics } from '../../hooks/useHaptics';
import { colors } from '../../theme/colors';
import { CARD_WIDTH, metrics, SNAP_INTERVAL } from '../../theme/metrics';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/format';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Product>);

const PATTERN_IMAGE = require('../../assets/gia-pattern.jpg');

/** Margen lateral que deja la tarjeta enfocada centrada en pantalla. */
const CAROUSEL_INSET = Math.max(16, Math.round((metrics.screen.width - CARD_WIDTH) / 2));

/** Publicaciones de @giagelateria con miniatura local (webp de unos KB). */
const IG_POSTS = [
  { path: 'p/DO3tLdiDn5X', thumb: require('../../assets/ig/DO3tLdiDn5X.webp') },
  { path: 'reel/DZ5bkHHJ2Yd', thumb: require('../../assets/ig/DZ5bkHHJ2Yd.webp') },
  { path: 'p/DYUvzmUjodq', thumb: require('../../assets/ig/DYUvzmUjodq.webp') },
  { path: 'p/DYcmM1_jhyT', thumb: require('../../assets/ig/DYcmM1_jhyT.webp') },
  { path: 'p/DVerXL3Dj2u', thumb: require('../../assets/ig/DVerXL3Dj2u.webp') },
] as const;

/** Póster de ubicación (reemplaza el mapa embebido, que cargaba lento). */
const UBICACION_IMAGE = require('../../assets/ubicacion.webp');

const IG_CARD_WIDTH = Math.min(330, metrics.screen.width - metrics.paddingHome * 2);
const IG_CARD_HEIGHT = 440;

/** The carousel opens on the featured flavor. */
const FEATURED_INDEX = productIndexById(FEATURED_PRODUCT_ID);

type ChipId = 'all' | 'clasico' | 'frutal' | 'especial';

/** Píldora-enlace reutilizable de las secciones informativas. */
const LinkPill: React.FC<{ label: string; onPress: () => void; gold?: boolean }> = ({
  label,
  onPress,
  gold = false,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.linkPill,
      gold ? styles.linkPillGold : styles.linkPillNavy,
      pressed && styles.linkPillPressed,
    ]}
  >
    <Text style={[styles.linkPillText, gold ? styles.linkPillTextNavy : styles.linkPillTextCream]}>
      {label}
    </Text>
  </Pressable>
);

/** Encabezado de sección con subrayado dorado GIA. */
const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.sectionHeading}>
    <Text style={typography.detailTitle}>{title}</Text>
    <View style={styles.goldBar} />
  </View>
);

/**
 * Home — landing de Gia Gelatería: hero con el patrón zigzag y el logo
 * centrado, carrusel de sabores con filtros por categoría, y secciones
 * informativas (precios, ubicación, redes) al estilo one-page del sitio.
 */
export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();

  const scrollX = useSharedValue(FEATURED_INDEX * SNAP_INTERVAL);
  const listRef = useRef<FlatList<Product>>(null);
  const [activeChip, setActiveChip] = useState<ChipId>('all');
  /** Vista de sabores: carrusel destacado o cuadrícula de 2 columnas. */
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  const toggleView = useCallback(() => {
    haptics.light();
    setViewMode((prev) => (prev === 'carousel' ? 'grid' : 'carousel'));
  }, [haptics]);

  /** Filtro real por categoría. */
  const filteredProducts = useMemo(
    () => (activeChip === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeChip)),
    [activeChip],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const openProduct = useCallback(
    (product: Product) => {
      haptics.light();
      router.push(`/product/${product.id}`);
    },
    [router, haptics],
  );

  const selectChip = useCallback(
    (id: ChipId) => {
      setActiveChip(id);
      haptics.light();
      // La lista cambia: volver al inicio del carrusel.
      scrollX.value = 0;
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    },
    [haptics, scrollX],
  );

  const scrollNext = useCallback(() => {
    haptics.light();
    const count = filteredProducts.length;
    if (count === 0) return;
    const current = Math.round(scrollX.value / SNAP_INTERVAL);
    const next = (current + 1) % count;
    listRef.current?.scrollToOffset({ offset: next * SNAP_INTERVAL, animated: true });
  }, [haptics, filteredProducts.length, scrollX]);

  const renderItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ProductCard
        product={item}
        scrollX={scrollX}
        index={index}
        snapInterval={SNAP_INTERVAL}
        onPress={openProduct}
      />
    ),
    [scrollX, openProduct],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<Product> | null | undefined, index: number) => ({
      length: SNAP_INTERVAL,
      offset: SNAP_INTERVAL * index,
      index,
    }),
    [],
  );

  const openLink = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  return (
    <AppBackground>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: metrics.miniCartHeight + insets.bottom + 20,
        }}
      >
        {/* Hero: patrón GIA + logo centrado */}
        <Animated.View entering={FadeInDown.duration(420)}>
          <View style={[styles.hero, { paddingTop: insets.top + 22 }]}>
            <Image source={PATTERN_IMAGE} style={styles.heroPattern} resizeMode="cover" />
            <Pressable
              onPress={() => openLink(BUSINESS.instagramUrl)}
              style={styles.logoCard}
            >
              <Image source={AVATAR_IMAGE} style={styles.logo} resizeMode="contain" />
            </Pressable>
          </View>
          <Text style={styles.tagline}>
            {'Auténtico '}
            <Text style={styles.taglineScript}>Gelato</Text>
            {' artesanal'}
          </Text>
        </Animated.View>

        {/* Category chips — scroll horizontal */}
        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsRow}
          >
            <CategoryChip
              label="Todos"
              variant="text"
              active={activeChip === 'all'}
              onPress={() => selectChip('all')}
            />
            <CategoryChip
              label="Clásicos"
              variant="iconLabel"
              icon={
                <IceCreamConeIcon
                  size={20}
                  color={activeChip === 'clasico' ? colors.text : colors.chipIconInactive}
                />
              }
              active={activeChip === 'clasico'}
              onPress={() => selectChip('clasico')}
            />
            <CategoryChip
              label="Frutales"
              variant="iconLabel"
              icon={
                <PopsicleIcon
                  size={20}
                  color={activeChip === 'frutal' ? colors.text : colors.chipIconInactive}
                />
              }
              active={activeChip === 'frutal'}
              onPress={() => selectChip('frutal')}
            />
            <CategoryChip
              label="Especiales"
              variant="iconLabel"
              icon={
                <CandyIcon
                  size={20}
                  color={activeChip === 'especial' ? colors.text : colors.chipIconInactive}
                />
              }
              active={activeChip === 'especial'}
              onPress={() => selectChip('especial')}
            />
          </ScrollView>
        </Animated.View>

        {/* Section label + toggle de vista + arrow */}
        <Animated.View entering={FadeInDown.delay(140).duration(420)} style={styles.sectionRow}>
          <Text style={typography.sectionTitle}>Sabores de temporada</Text>
          <View style={styles.sectionControls}>
            <Pressable onPress={toggleView} hitSlop={10} style={styles.arrowButton}>
              {viewMode === 'carousel' ? (
                <GridIcon size={19} color={colors.primary} strokeWidth={1.8} />
              ) : (
                <CarouselIcon size={19} color={colors.primary} strokeWidth={1.8} />
              )}
            </Pressable>
            {viewMode === 'carousel' && (
              <Pressable onPress={scrollNext} hitSlop={10} style={styles.arrowButton}>
                <ArrowRightIcon size={22} color={colors.primary} strokeWidth={1.8} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {viewMode === 'carousel' ? (
          /* Featured carousel */
          <View style={styles.carouselWrap}>
            <AnimatedFlatList
              ref={listRef}
              data={filteredProducts}
              horizontal
              initialScrollIndex={FEATURED_INDEX}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              onScroll={onScroll}
              scrollEventThrottle={16}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              disableIntervalMomentum
              showsHorizontalScrollIndicator={false}
              windowSize={3}
              initialNumToRender={3}
              contentContainerStyle={styles.listContent}
              style={styles.list}
            />
          </View>
        ) : (
          /* Cuadrícula de 2 columnas */
          <View style={styles.gridWrap}>
            {filteredProducts.map((p, i) => (
              <GridProductCard key={p.id} product={p} index={i} onPress={openProduct} />
            ))}
          </View>
        )}

        {/* Precios */}
        <View style={styles.section}>
          <SectionHeading title="Nuestros tamaños" />
          <View style={styles.pricesCard}>
            {SIZES.map((s, i) => (
              <View key={s.id}>
                {i > 0 && <View style={styles.pricesDivider} />}
                <View style={styles.priceRow}>
                  <View style={styles.priceRowText}>
                    <Text style={typography.sectionTitle}>{s.label}</Text>
                    <Text style={typography.caption}>{s.description}</Text>
                  </View>
                  <Text style={styles.priceText}>{formatPrice(s.price, { space: true })}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Pide a domicilio */}
        <View style={styles.section}>
          <SectionHeading title="Pide a domicilio" />
          <Text style={[typography.caption, styles.sectionText]}>
            Arma tu pedido aquí y envíalo por WhatsApp, o encuéntranos en Rappi.
          </Text>
          <View style={styles.pillsRow}>
            <LinkPill
              label="Pedir por WhatsApp"
              onPress={() => openLink(whatsappUrl('¡Hola GIA! 🍦 Quiero hacer un pedido.'))}
            />
            <Pressable
              onPress={() => openLink(BUSINESS.rappiUrl)}
              style={({ pressed }) => [styles.rappiPill, pressed && styles.linkPillPressed]}
            >
              <RappiLogo width={62} />
            </Pressable>
          </View>
        </View>

        {/* Visítanos */}
        <View style={styles.section}>
          <SectionHeading title="Visítanos" />
          <Text style={[typography.caption, styles.sectionText]}>{BUSINESS.address}</Text>
          <Pressable
            onPress={() => openLink(BUSINESS.mapsUrl)}
            style={({ pressed }) => [styles.mapWrap, pressed && styles.mapPressed]}
          >
            <Image source={UBICACION_IMAGE} style={styles.mapImage} resizeMode="cover" />
          </Pressable>
          <View style={styles.pillsRow}>
            <LinkPill gold label="Cómo llegar" onPress={() => openLink(BUSINESS.mapsUrl)} />
          </View>
        </View>

        {/* Síguenos */}
        <View style={styles.section}>
          <SectionHeading title="Síguenos" />
          <Text style={[typography.caption, styles.sectionText]}>
            {`${BUSINESS.instagramHandle} · WhatsApp ${BUSINESS.whatsappDisplay}`}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.igScroll}
            contentContainerStyle={styles.igRow}
          >
            {IG_POSTS.map((post) => (
              <View key={post.path} style={styles.igCard}>
                <InstagramCard
                  post={post.path}
                  thumb={post.thumb}
                  width={IG_CARD_WIDTH}
                  height={IG_CARD_HEIGHT}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.pillsRow}>
            <LinkPill label="Instagram" onPress={() => openLink(BUSINESS.instagramUrl)} />
            <LinkPill label="Facebook" onPress={() => openLink(BUSINESS.facebookUrl)} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Image source={AVATAR_IMAGE} style={styles.footerLogo} resizeMode="contain" />
          <Text style={[typography.caption, styles.footerText]}>
            {`${BUSINESS.name} · ${BUSINESS.address}`}
          </Text>
        </View>
      </ScrollView>

      <MiniCartBar onPress={() => router.push('/cart')} />
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 28,
    overflow: 'hidden',
  },
  heroPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  logoCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 210,
    height: 84,
  },
  tagline: {
    ...typography.greeting,
    fontSize: 22,
    lineHeight: 44,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: metrics.paddingHome,
  },
  taglineScript: {
    ...typography.greetingBold,
    fontSize: 36,
    lineHeight: 44,
  },

  /* Chips */
  chipsScroll: {
    flexGrow: 0,
    marginTop: 20,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: metrics.paddingHome,
  },

  /* Carousel */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.paddingHome,
    marginTop: 26,
  },
  sectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowButton: {
    width: metrics.arrowButton,
    height: metrics.arrowButton,
    borderRadius: metrics.arrowButton / 2,
    backgroundColor: colors.chipActiveBg,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: metrics.paddingHome,
    marginTop: 14,
  },
  carouselWrap: {
    marginTop: 6,
  },
  list: {
    flexGrow: 0,
    height: metrics.cardHeight + 24,
  },
  listContent: {
    paddingLeft: CAROUSEL_INSET,
    paddingRight: CAROUSEL_INSET - metrics.cardGap,
    paddingVertical: 12,
    alignItems: 'center',
  },

  /* Secciones informativas */
  section: {
    paddingHorizontal: metrics.paddingHome,
    marginTop: 40,
  },
  sectionHeading: {
    marginBottom: 16,
  },
  goldBar: {
    width: 46,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: 8,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  pricesCard: {
    backgroundColor: colors.white60,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.chipActiveBorder,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  pricesDivider: {
    height: 1,
    backgroundColor: colors.dividerDark,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  priceRowText: {
    gap: 2,
  },
  priceText: {
    ...typography.cartRowPrice,
    fontSize: 16,
    color: colors.primary,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mapWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.chipActiveBorder,
    marginBottom: 14,
    alignSelf: 'center',
  },
  mapPressed: {
    opacity: 0.92,
  },
  /** Dimensiones fijas: máx ~300px de alto (proporción del póster 460x816). */
  mapImage: {
    width: 170,
    height: 300,
  },
  igScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  igRow: {
    gap: 14,
  },
  igCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.chipActiveBorder,
    backgroundColor: colors.white,
  },
  linkPill: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkPillNavy: {
    backgroundColor: colors.primary,
  },
  linkPillGold: {
    backgroundColor: colors.gold,
  },
  linkPillPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  linkPillText: {
    fontSize: 15,
  },
  linkPillTextCream: {
    color: colors.creamText,
  },
  linkPillTextNavy: {
    color: colors.primary,
  },
  rappiPill: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,68,31,0.25)',
  },

  /* Footer */
  footer: {
    marginTop: 30,
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerLogo: {
    width: 120,
    height: 48,
  },
  footerText: {
    marginTop: 8,
    textAlign: 'center',
  },
});
