// src/lib/storage.ts
import { supabase } from '@/lib/supabase';

const BUCKET = 'product-images';

export async function uploadProductImageFromUri(localUri: string) {
  const extFromUri = localUri.split('.').pop()?.toLowerCase();
  const ext = extFromUri && extFromUri.length <= 5 ? extFromUri : 'jpg';

  const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const filePath = `products/${fileName}`;

  // local file uri -> blob
  const res = await fetch(localUri);
  const blob = await res.blob();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, blob, {
      contentType: blob.type || `image/${ext}`,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: data.publicUrl,
  };
}
