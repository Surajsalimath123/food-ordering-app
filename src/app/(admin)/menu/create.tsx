import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type PickedImage = ImagePicker.ImagePickerAsset;

export default function CreateProductScreen() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(''); // keep as string for TextInput
  const [image, setImage] = useState<PickedImage | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Ask permission (esp. important on iOS)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo access to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const uploadImageToSupabase = async (picked: PickedImage) => {
    // Create a unique file path in the bucket
    const uri = picked.uri;

    const extFromUri = uri.split('.').pop()?.toLowerCase();
    const ext = extFromUri && extFromUri.length <= 5 ? extFromUri : 'jpg';

    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    const filePath = `products/${fileName}`; // folder inside bucket

    // Convert local file URI -> Blob
    const res = await fetch(uri);
    const blob = await res.blob();

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, blob, {
        contentType: blob.type || `image/${ext}`,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Generate a public URL (bucket is PUBLIC)
    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);

    return {
      filePath,
      publicUrl: data.publicUrl,
    };
  };

  const onCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a name');
      return;
    }

    const numericPrice = Number(price);
    if (!price || Number.isNaN(numericPrice)) {
      Alert.alert('Validation', 'Please enter a valid price');
      return;
    }

    try {
      setLoading(true);

      let imageUrl: string | null = null;

      if (image) {
        const uploaded = await uploadImageToSupabase(image);
        imageUrl = uploaded.publicUrl;
      }

      const { error } = await supabase.from('products').insert({
        name: name.trim(),
        price: numericPrice,
        image: imageUrl, // store the public URL (or null)
      });

      if (error) throw error;

      Alert.alert('Success', 'Product created!');
      router.back();
    } catch (e: any) {
      console.log(e);
      Alert.alert('Error', e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Product' }} />

      <Pressable onPress={pickImage} style={styles.imageBox}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.image} />
        ) : (
          <Text style={styles.noImageText}>No image</Text>
        )}
      </Pressable>

      <Pressable onPress={pickImage} style={styles.linkButton}>
        <Text style={styles.linkButtonText}>Select Image</Text>
      </Pressable>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Margherita"
        style={styles.input}
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="12.99"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Pressable onPress={onCreate} style={styles.primaryButton} disabled={loading}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.primaryButtonText}>Create</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10, backgroundColor: 'white' },

  imageBox: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  noImageText: { color: '#6b7280' },

  linkButton: { alignSelf: 'center', paddingVertical: 10 },
  linkButtonText: { color: '#2563eb', fontWeight: '600' },

  label: { fontSize: 14, color: '#111827', marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  primaryButton: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: 'white', fontWeight: '700' },
});
