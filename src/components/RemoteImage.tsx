import { supabase } from '@/lib/supabase';
import { Image, ImageProps } from 'react-native';

type Props = Omit<ImageProps, 'source'> & {
  path?: string | null;
};

export default function RemoteImage({ path, ...imageProps }: Props) {
  if (!path) {
    // ✅ fallback (keeps UI clean)
    return (
      <Image
        {...imageProps}
        source={{ uri: 'https://via.placeholder.com/300x300.png?text=No+Image' }}
      />
    );
  }

  // If already a full URL, use it directly
  if (path.startsWith('http')) {
    return <Image {...imageProps} source={{ uri: path }} />;
  }

  // Otherwise assume it's a Supabase Storage path like: "products/pepperoni.png"
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);

  return <Image {...imageProps} source={{ uri: data.publicUrl }} />;
}
