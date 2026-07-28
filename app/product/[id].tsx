import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ProductScreen } from '@/src/screens/Product/ProductScreen';

export default function Product() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductScreen productId={id} />;
}
