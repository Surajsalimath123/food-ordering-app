import ProductForm, { FormValues } from '@/components/admin/ProductForm';
import { useProducts } from '@/providers/ProductsProvider';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Text } from 'react-native';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);

  const { getById, updateProduct, deleteProduct } = useProducts();

  const product = useMemo(() => getById(productId), [productId, getById]);

  if (!product) return <Text style={{ padding: 16 }}>Product not found.</Text>;

  const onUpdate = (values: FormValues) => {
    updateProduct(productId, {
      name: values.name,
      price: Number(values.price),
      image: values.image ?? null,
    });

    Alert.alert('Updated ✅', 'In-memory (UI only).', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const onDelete = () => {
    deleteProduct(productId);
    Alert.alert('Deleted ✅', 'In-memory (UI only).', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ProductForm
      mode="edit"
      defaultValues={{
        name: product.name,
        price: String(product.price),
        image: product.image ?? null,
      }}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );
}
