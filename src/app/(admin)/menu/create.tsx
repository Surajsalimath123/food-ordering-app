import ProductForm, { FormValues } from '@/components/admin/ProductForm';
import { useProducts } from '@/providers/ProductsProvider';
import { router } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';

export default function CreateProductScreen() {
  const { createProduct } = useProducts();

  const onCreate = (values: FormValues) => {
    createProduct({
      name: values.name,
      price: Number(values.price),
      image: values.image ?? null,
    });

    Alert.alert('Created ✅', 'In-memory (UI only).', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return <ProductForm mode="create" onCreate={onCreate} />;
}
