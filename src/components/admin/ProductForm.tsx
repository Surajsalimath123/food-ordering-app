// src/components/admin/ProductForm.tsx
import { uploadProductImageFromUri } from '@/lib/storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
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

export type FormValues = {
  name: string;
  price: string; // keep string for TextInput
  image: string | null; // store PUBLIC URL here
};

type Props = {
  mode: 'create' | 'edit';
  defaultValues?: FormValues;
  onCreate?: (values: FormValues) => Promise<void>;
  onUpdate?: (values: FormValues) => Promise<void>;
  onDelete?: () => void;

  // optional: pass pending flags if you have them
  loading?: boolean;
};

export default function ProductForm({
  mode,
  defaultValues,
  onCreate,
  onUpdate,
  onDelete,
  loading,
}: Props) {
  const initial = useMemo<FormValues>(
    () =>
      defaultValues ?? {
        name: '',
        price: '',
        image: null,
      },
    [defaultValues]
  );

  const [name, setName] = useState(initial.name);
  const [price, setPrice] = useState(initial.price);
  const [image, setImage] = useState<string | null>(initial.image);

  const [uploading, setUploading] = useState(false);

  const pickAndUploadImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Please allow photo access to select an image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset?.uri) return;

      setUploading(true);

      const uploaded = await uploadProductImageFromUri(asset.uri);

      // store public url in form
      setImage(uploaded.publicUrl);
    } catch (e: any) {
      console.log('❌ Image upload failed:', e);
      Alert.alert('Image upload failed', e?.message ?? 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a name');
      return;
    }

    const numericPrice = Number(price);
    if (!price || Number.isNaN(numericPrice)) {
      Alert.alert('Validation', 'Please enter a valid price');
      return;
    }

    const values: FormValues = {
      name: name.trim(),
      price: String(numericPrice),
      image: image ?? null,
    };

    try {
      if (mode === 'create') {
        if (!onCreate) throw new Error('onCreate not provided');
        await onCreate(values);
      } else {
        if (!onUpdate) throw new Error('onUpdate not provided');
        await onUpdate(values);
      }
    } catch (e: any) {
      console.log('❌ Save failed:', e);
      Alert.alert('Save failed', e?.message ?? 'Unknown error');
    }
  };

  const isBusy = Boolean(loading || uploading);

  return (
    <View style={styles.container}>
      <Pressable onPress={pickAndUploadImage} style={styles.imageBox} disabled={isBusy}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.noImageText}>No image</Text>
        )}
      </Pressable>

      <Pressable onPress={pickAndUploadImage} disabled={isBusy} style={styles.linkButton}>
        <Text style={styles.linkButtonText}>
          {uploading ? 'Uploading...' : 'Select Image'}
        </Text>
      </Pressable>

      <Text style={styles.label}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Pressable onPress={submit} disabled={isBusy} style={styles.primaryButton}>
        {isBusy ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.primaryButtonText}>
            {mode === 'create' ? 'Create' : 'Update'}
          </Text>
        )}
      </Pressable>

      {mode === 'edit' && onDelete && (
        <Pressable onPress={onDelete} disabled={isBusy} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      )}
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

  deleteButton: {
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#ef4444', fontWeight: '700' },
});
