import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type FormValues = {
  name: string;
  price: string; // keep as string for TextInput
  image?: string | null;
};

type CreateProps = {
  mode: 'create';
  defaultValues?: Partial<FormValues>;
  onCreate: (values: FormValues) => void;
};

type EditProps = {
  mode: 'edit';
  defaultValues: FormValues;
  onUpdate: (values: FormValues) => void;
  onDelete: () => void;
};

type Props = CreateProps | EditProps;

export default function ProductForm(props: Props) {
  const initial = useMemo<FormValues>(() => {
    if (props.mode === 'edit') return props.defaultValues;
    return {
      name: props.defaultValues?.name ?? '',
      price: props.defaultValues?.price ?? '',
      image: props.defaultValues?.image ?? null,
    };
  }, [props]);

  const [name, setName] = useState(initial.name);
  const [price, setPrice] = useState(initial.price);
  const [image, setImage] = useState<string | null>(initial.image ?? null);

  const primaryLabel = props.mode === 'edit' ? 'Update' : 'Create';

  const onSubmit = () => {
    const cleanName = name.trim();
    const cleanPrice = price.trim();

    if (!cleanName) {
      Alert.alert('Missing name', 'Please enter a product name.');
      return;
    }
    const num = Number(cleanPrice);
    if (!cleanPrice || Number.isNaN(num)) {
      Alert.alert('Invalid price', 'Please enter a valid number.');
      return;
    }

    const payload: FormValues = { name: cleanName, price: cleanPrice, image };

    if (props.mode === 'edit') props.onUpdate(payload);
    else props.onCreate(payload);
  };

  const onPickImage = () => {
    // UI-only for now (wire ImagePicker later)
    Alert.alert('Select Image', 'Wire Image Picker later (UI only).');
  };

  const confirmDelete = () => {
    if (props.mode !== 'edit') return;
    Alert.alert('Delete product?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: props.onDelete },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageBox}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.noImageText}>No image</Text>
        )}
      </View>

      <Pressable onPress={onPickImage}>
        <Text style={styles.selectImage}>Select Image</Text>
      </Pressable>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Margarita..."
        style={styles.input}
      />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="9.99"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Pressable onPress={onSubmit} style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
      </Pressable>

      {props.mode === 'edit' && (
        <Pressable onPress={confirmDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  imageBox: {
    height: 180,
    borderRadius: 14,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  noImageText: { color: '#777' },

  selectImage: { color: '#1677ff', textAlign: 'center', fontWeight: '600', marginTop: 6 },

  label: { marginTop: 10, marginBottom: 4, fontWeight: '600', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },

  primaryBtn: {
    marginTop: 14,
    backgroundColor: '#1677ff',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },

  deleteBtn: {
    borderWidth: 2,
    borderColor: '#ff3b30',
    padding: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 6,
  },
  deleteBtnText: { color: '#ff3b30', fontWeight: '800', fontSize: 16 },
});
