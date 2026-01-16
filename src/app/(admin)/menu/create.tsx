import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { decode } from 'base64-arraybuffer';
import { randomUUID } from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

const DEFAULT_IMAGE =
  'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png';

export default function CreateProductScreen() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validateInput = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a product name.');
      return false;
    }

    const p = Number(price);
    if (Number.isNaN(p) || p <= 0) {
      Alert.alert('Validation', 'Please enter a valid price.');
      return false;
    }

    return true;
  };

  const pickImage = async () => {
    // optional: request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access to pick an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri: string | null): Promise<string | null> => {
    if (!imageUri || !imageUri.startsWith('file://')) return null;

    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
    const filePath = `${randomUUID()}.png`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, decode(base64), { contentType: 'image/png' });

    if (error) {
      console.log('Upload error:', error.message);
      Alert.alert('Upload failed', error.message);
      return null;
    }

    return data?.path ?? null;
  };

  const onCreate = async () => {
    if (!validateInput()) return;

    setSaving(true);
    try {
      const uploadedPath = await uploadImage(image);

      // ✅ IMPORTANT: image must always exist on Product (string | null)
      const newProduct: Omit<Product, 'id'> = {
        name: name.trim(),
        price: Number(price),
        image: uploadedPath, // null if no upload
      };

      const { error } = await supabase.from('products').insert(newProduct);

      if (error) {
        console.log('Insert error:', error.message);
        Alert.alert('Create failed', error.message);
        return;
      }

      setName('');
      setPrice('');
      setImage(null);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Product' }} />

      <Pressable onPress={pickImage} style={styles.imagePicker}>
        <Image
          source={{ uri: image ?? DEFAULT_IMAGE }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.imageText}>Tap to select image</Text>
      </Pressable>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Pepperoni Pizza"
        style={styles.input}
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="e.g. 12.99"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Pressable onPress={onCreate} disabled={saving} style={styles.button}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Create'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: 'white' },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  image: { width: '100%', height: 200 },
  imageText: { marginTop: 8, fontWeight: '600' },
  label: { fontWeight: '600', marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
  },
  button: {
    marginTop: 10,
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '700' },
});
