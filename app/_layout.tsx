import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router/stack';
import { useFonts } from 'expo-font';
import { CartProvider } from '@/src/services/cartStore';

const GIA_LOGO = require('@/src/assets/generated-products/gia-logo.png');
const GIA_PATTERN = require('@/src/assets/gia-pattern.jpg');

/** Pantalla de carga con la marca GIA (patrón arriba/abajo + logo). */
const Splash: React.FC = () => (
  <View style={styles.splashRoot}>
    <Image source={GIA_PATTERN} style={styles.splashBandTop} resizeMode="cover" />
    <View style={styles.splashCenter}>
      <Image source={GIA_LOGO} style={styles.splashLogo} resizeMode="contain" />
      <ActivityIndicator color="#364266" style={styles.splashSpinner} />
    </View>
    <Image source={GIA_PATTERN} style={styles.splashBandBottom} resizeMode="cover" />
  </View>
);

/** Tiempo mínimo del splash para que la marca se alcance a ver. */
const SPLASH_MIN_MS = 450;

/**
 * Root layout (SPEC §7): native stack, headerShown false.
 * Home -> Product (fade_from_bottom) -> Cart (modal slide-up).
 * Carga las familias de la marca GIA antes de renderizar.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Lapture-Regular': require('@/src/assets/fonts/Lapture-Regular.otf'),
    'Lapture-Semibold': require('@/src/assets/fonts/Lapture-Semibold.otf'),
    'PlayfairDisplay-SemiBold': require('@/src/assets/fonts/PlayfairDisplay-SemiBold.ttf'),
    'PlayfairDisplay-Bold': require('@/src/assets/fonts/PlayfairDisplay-Bold.ttf'),
    'PlayfairDisplay-Italic': require('@/src/assets/fonts/PlayfairDisplay-Italic.ttf'),
    'GreatVibes-Regular': require('@/src/assets/fonts/GreatVibes-Regular.ttf'),
  });
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded || !splashDone) {
    return <Splash />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="product/[id]" options={{ animation: 'fade_from_bottom' }} />
            <Stack.Screen
              name="cart"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack>
        </CartProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashRoot: {
    flex: 1,
    backgroundColor: '#FEF3DE',
    justifyContent: 'space-between',
  },
  splashBandTop: {
    width: '100%',
    height: 64,
  },
  splashBandBottom: {
    width: '100%',
    height: 64,
  },
  splashCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 220,
    height: 92,
  },
  splashSpinner: {
    marginTop: 26,
  },
});
