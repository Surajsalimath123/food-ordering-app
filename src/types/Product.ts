export type Product = {
  id: number;
  name: string;
  image: string | null; // ✅ Supabase-friendly
  price: number;
};
