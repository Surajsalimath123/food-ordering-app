// src/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          name: string;
          price: number;
          image: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          price: number;
          image?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          price?: number;
          image?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      profiles: {
        Row: {
          id: string; // uuid (same as auth.users.id)
          role: 'ADMIN' | 'USER' | string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          role?: 'ADMIN' | 'USER' | string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          role?: 'ADMIN' | 'USER' | string;
          created_at?: string | null;
        };
        Relationships: [];
      };

      orders: {
        Row: {
          id: number;
          created_at: string;
          user_id: string | null;
          status: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id?: string | null;
          status?: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string | null;
          status?: string;
        };
        Relationships: [];
      };

      order_items: {
        Row: {
          id: number;
          created_at: string | null;
          order_id: number;
          product_id: number;
          quantity: number;
          size: string; // 'S' | 'M' | 'L' | 'XL'
        };
        Insert: {
          id?: number;
          created_at?: string | null;
          order_id: number;
          product_id: number;
          quantity: number;
          size: string;
        };
        Update: {
          id?: number;
          created_at?: string | null;
          order_id?: number;
          product_id?: number;
          quantity?: number;
          size?: string;
        };
        Relationships: [];
      };
    };

    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
