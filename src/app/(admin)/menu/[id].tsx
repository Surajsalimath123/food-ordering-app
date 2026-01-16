import {
  useDeleteProduct,
  useProduct,
  useUpdateProduct,
} from '@/api/products';
import ProductForm, { FormValues } from '@/components/admin/ProductForm';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const productId = Number(id);
  const isValidId = Number.isFinite(productId) && productId > 0;

  const { data: product, isLoading, error } = useProduct(productId);

  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  if (!isValidId) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Invalid product id</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !product) {
    console.log('❌ Failed to load product:', error);
    return (
      <View style={{ padding: 16 }}>
        <Text>Failed to load product</Text>
      </View>
    );
  }

  const onUpdate = async (values: FormValues) => {
    try {
      await updateProduct({
        id: productId,
        name: values.name,
        price: Number(values.price),
        image: values.image ?? null,
      });

      Alert.alert('Updated ✅', 'Saved to Supabase.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.log('❌ Update failed:', e);
      Alert.alert('Update failed', e?.message ?? 'Unknown error');
    }
  };

  const onDelete = async () => {
    Alert.alert('Delete product?', 'This will remove it from Supabase.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(productId);
            Alert.alert('Deleted ✅', 'Removed from Supabase.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (e: any) {
            console.log('❌ Delete failed:', e);
            Alert.alert('Delete failed', e?.message ?? 'Unknown error');
          }
        },
      },
    ]);
  };

  return (
    <ProductForm
      mode="edit"
      loading={isUpdating || isDeleting}
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
