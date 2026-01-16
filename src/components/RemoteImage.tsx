import { supabase } from '@/lib/supabase';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, ImageProps, StyleSheet, View } from 'react-native';

type Props = Omit<ImageProps, 'source'> & {
  path?: string | null;        // storage path OR full URL
  bucket?: string;             // default bucket for images
};

export default function RemoteImage({
  path,
  bucket = 'product-images',
  style,
  ...imageProps
}: Props) {
  const [loading, setLoading] = useState(false);

  const uri = useMemo(() => {
    if (!path) return null;

    // already a full URL (http/https)
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // treat as supabase storage path
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl ?? null;
  }, [path, bucket]);

  if (!uri) {
    return (
      <View style={[styles.placeholder, style]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <Image
        {...imageProps}
        source={{ uri }}
        style={[StyleSheet.absoluteFill, { width: undefined, height: undefined }, style]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
  },
  placeholder: {
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
