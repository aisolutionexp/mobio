export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string;
          complement: string | null;
          country: string;
          created_at: string;
          district: string;
          factory_id: string | null;
          id: string;
          is_default: boolean;
          label: string;
          number: string | null;
          retailer_id: string | null;
          state: string;
          street: string;
          updated_at: string;
          zip_code: string;
        };
        Insert: {
          city: string;
          complement?: string | null;
          country?: string;
          created_at?: string;
          district: string;
          factory_id?: string | null;
          id?: string;
          is_default?: boolean;
          label?: string;
          number?: string | null;
          retailer_id?: string | null;
          state: string;
          street: string;
          updated_at?: string;
          zip_code: string;
        };
        Update: {
          city?: string;
          complement?: string | null;
          country?: string;
          created_at?: string;
          district?: string;
          factory_id?: string | null;
          id?: string;
          is_default?: boolean;
          label?: string;
          number?: string | null;
          retailer_id?: string | null;
          state?: string;
          street?: string;
          updated_at?: string;
          zip_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "addresses_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
        ];
      };
      board_items: {
        Row: {
          added_at: string;
          added_by: string;
          board_id: string;
          id: string;
          position: number;
          product_id: string;
        };
        Insert: {
          added_at?: string;
          added_by: string;
          board_id: string;
          id?: string;
          position?: number;
          product_id: string;
        };
        Update: {
          added_at?: string;
          added_by?: string;
          board_id?: string;
          id?: string;
          position?: number;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "board_items_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "boards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "board_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      boards: {
        Row: {
          cover_url: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          is_public: boolean;
          name: string;
          retailer_id: string;
          updated_at: string;
        };
        Insert: {
          cover_url?: string | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          name: string;
          retailer_id: string;
          updated_at?: string;
        };
        Update: {
          cover_url?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          name?: string;
          retailer_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "boards_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          created_at: string;
          description: string | null;
          factory_id: string;
          id: string;
          is_active: boolean;
          name: string;
          published_at: string | null;
          season: string | null;
          slug: string;
          status: string;
          updated_at: string;
          year: number | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          factory_id: string;
          id?: string;
          is_active?: boolean;
          name: string;
          published_at?: string | null;
          season?: string | null;
          slug: string;
          status?: string;
          updated_at?: string;
          year?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          factory_id?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          published_at?: string | null;
          season?: string | null;
          slug?: string;
          status?: string;
          updated_at?: string;
          year?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "collections_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
        ];
      };
      factories: {
        Row: {
          cnpj: string | null;
          cover_path: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          email: string | null;
          id: string;
          is_active: boolean;
          logo_path: string | null;
          name: string;
          phone: string | null;
          region_id: string | null;
          slug: string;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          cnpj?: string | null;
          cover_path?: string | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          logo_path?: string | null;
          name: string;
          phone?: string | null;
          region_id?: string | null;
          slug: string;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          cnpj?: string | null;
          cover_path?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          logo_path?: string | null;
          name?: string;
          phone?: string | null;
          region_id?: string | null;
          slug?: string;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "factories_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
        ];
      };
      factory_categories: {
        Row: {
          category_id: string;
          created_at: string;
          factory_id: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          factory_id: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          factory_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "factory_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "factory_categories_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: {
          created_at: string;
          factory_id: string | null;
          id: string;
          product_id: string | null;
          retailer_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          factory_id?: string | null;
          id?: string;
          product_id?: string | null;
          retailer_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          factory_id?: string | null;
          id?: string;
          product_id?: string | null;
          retailer_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
        ];
      };
      finishes: {
        Row: {
          created_at: string;
          description: string | null;
          factory_id: string;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          factory_id: string;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          factory_id?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "finishes_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
        ];
      };
      invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          factory_id: string | null;
          id: string;
          invited_by: string;
          retailer_id: string | null;
          role: string;
          status: string;
          token: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          factory_id?: string | null;
          id?: string;
          invited_by: string;
          retailer_id?: string | null;
          role: string;
          status?: string;
          token?: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          factory_id?: string | null;
          id?: string;
          invited_by?: string;
          retailer_id?: string | null;
          role?: string;
          status?: string;
          token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invites_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invites_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
        ];
      };
      linesheet_items: {
        Row: {
          created_at: string;
          custom_price: number | null;
          id: string;
          linesheet_id: string;
          position: number;
          product_id: string;
        };
        Insert: {
          created_at?: string;
          custom_price?: number | null;
          id?: string;
          linesheet_id: string;
          position?: number;
          product_id: string;
        };
        Update: {
          created_at?: string;
          custom_price?: number | null;
          id?: string;
          linesheet_id?: string;
          position?: number;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "linesheet_items_linesheet_id_fkey";
            columns: ["linesheet_id"];
            isOneToOne: false;
            referencedRelation: "linesheets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "linesheet_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      linesheets: {
        Row: {
          created_at: string;
          created_by: string;
          factory_id: string;
          id: string;
          name: string;
          status: string;
          target_retailer_id: string | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          factory_id: string;
          id?: string;
          name: string;
          status?: string;
          target_retailer_id?: string | null;
          type?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          factory_id?: string;
          id?: string;
          name?: string;
          status?: string;
          target_retailer_id?: string | null;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "linesheets_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "linesheets_target_retailer_id_fkey";
            columns: ["target_retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          is_read: boolean;
          link: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price_cents: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          product_id: string;
          quantity?: number;
          unit_price_cents: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          created_by: string;
          currency: string;
          factory_id: string;
          id: string;
          notes: string | null;
          payment_status: string;
          quote_id: string | null;
          retailer_id: string;
          shipping_address_id: string | null;
          status: string;
          total_cents: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          currency?: string;
          factory_id: string;
          id?: string;
          notes?: string | null;
          payment_status?: string;
          quote_id?: string | null;
          retailer_id: string;
          shipping_address_id?: string | null;
          status?: string;
          total_cents?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          currency?: string;
          factory_id?: string;
          id?: string;
          notes?: string | null;
          payment_status?: string;
          quote_id?: string | null;
          retailer_id?: string;
          shipping_address_id?: string | null;
          status?: string;
          total_cents?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey";
            columns: ["shipping_address_id"];
            isOneToOne: false;
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          created_at: string;
          currency: string;
          features: Json;
          id: string;
          is_active: boolean;
          name: string;
          price_cents: number;
          slug: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          features?: Json;
          id?: string;
          is_active?: boolean;
          name: string;
          price_cents?: number;
          slug: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          features?: Json;
          id?: string;
          is_active?: boolean;
          name?: string;
          price_cents?: number;
          slug?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          factory_id: string;
          id: string;
          is_cover: boolean;
          path: string;
          product_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          factory_id: string;
          id?: string;
          is_cover?: boolean;
          path: string;
          product_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          factory_id?: string;
          id?: string;
          is_cover?: boolean;
          path?: string;
          product_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_specs: {
        Row: {
          created_at: string;
          factory_id: string;
          id: string;
          product_id: string;
          sort_order: number;
          spec_key: string;
          spec_value: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          factory_id: string;
          id?: string;
          product_id: string;
          sort_order?: number;
          spec_key: string;
          spec_value: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          factory_id?: string;
          id?: string;
          product_id?: string;
          sort_order?: number;
          spec_key?: string;
          spec_value?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_specs_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_specs_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string | null;
          collection_id: string | null;
          created_at: string;
          description: string | null;
          factory_id: string;
          id: string;
          is_active: boolean;
          min_order_qty: number;
          name: string;
          published_at: string | null;
          reference: string | null;
          retail_price: number | null;
          slug: string;
          status: string | null;
          updated_at: string;
          wholesale_price: number | null;
        };
        Insert: {
          category_id?: string | null;
          collection_id?: string | null;
          created_at?: string;
          description?: string | null;
          factory_id: string;
          id?: string;
          is_active?: boolean;
          min_order_qty?: number;
          name: string;
          published_at?: string | null;
          reference?: string | null;
          retail_price?: number | null;
          slug: string;
          status?: string | null;
          updated_at?: string;
          wholesale_price?: number | null;
        };
        Update: {
          category_id?: string | null;
          collection_id?: string | null;
          created_at?: string;
          description?: string | null;
          factory_id?: string;
          id?: string;
          is_active?: boolean;
          min_order_qty?: number;
          name?: string;
          published_at?: string | null;
          reference?: string | null;
          retail_price?: number | null;
          slug?: string;
          status?: string | null;
          updated_at?: string;
          wholesale_price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          created_at: string;
          full_name: string;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_path?: string | null;
          created_at?: string;
          full_name: string;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_path?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      quote_items: {
        Row: {
          created_at: string;
          custom_specs: Json | null;
          id: string;
          product_id: string;
          quantity: number;
          quote_id: string;
          unit_price_cents: number;
        };
        Insert: {
          created_at?: string;
          custom_specs?: Json | null;
          id?: string;
          product_id: string;
          quantity?: number;
          quote_id: string;
          unit_price_cents: number;
        };
        Update: {
          created_at?: string;
          custom_specs?: Json | null;
          id?: string;
          product_id?: string;
          quantity?: number;
          quote_id?: string;
          unit_price_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
        ];
      };
      quotes: {
        Row: {
          created_at: string;
          created_by: string;
          currency: string;
          factory_id: string;
          id: string;
          notes: string | null;
          retailer_id: string;
          status: string;
          total_cents: number;
          updated_at: string;
          valid_until: string | null;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          currency?: string;
          factory_id: string;
          id?: string;
          notes?: string | null;
          retailer_id: string;
          status?: string;
          total_cents?: number;
          updated_at?: string;
          valid_until?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          currency?: string;
          factory_id?: string;
          id?: string;
          notes?: string | null;
          retailer_id?: string;
          status?: string;
          total_cents?: number;
          updated_at?: string;
          valid_until?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quotes_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
        ];
      };
      regions: {
        Row: {
          code: string;
          country: string;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          country?: string;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          country?: string;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      retailer_segments: {
        Row: {
          category_id: string;
          created_at: string;
          retailer_id: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          retailer_id: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          retailer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "retailer_segments_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "retailer_segments_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
        ];
      };
      retailers: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          email: string | null;
          id: string;
          is_active: boolean;
          logo_path: string | null;
          name: string;
          phone: string | null;
          region_id: string | null;
          slug: string;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          logo_path?: string | null;
          name: string;
          phone?: string | null;
          region_id?: string | null;
          slug: string;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          logo_path?: string | null;
          name?: string;
          phone?: string | null;
          region_id?: string | null;
          slug?: string;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "retailers_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
        ];
      };
      showroom_attendees: {
        Row: {
          created_at: string;
          id: string;
          retailer_id: string;
          showroom_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          retailer_id: string;
          showroom_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          retailer_id?: string;
          showroom_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "showroom_attendees_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "showroom_attendees_showroom_id_fkey";
            columns: ["showroom_id"];
            isOneToOne: false;
            referencedRelation: "showrooms";
            referencedColumns: ["id"];
          },
        ];
      };
      showrooms: {
        Row: {
          capacity: number | null;
          created_at: string;
          created_by: string;
          description: string | null;
          event_date: string | null;
          factory_id: string;
          id: string;
          location: string | null;
          name: string;
          status: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          capacity?: number | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          event_date?: string | null;
          factory_id: string;
          id?: string;
          location?: string | null;
          name: string;
          status?: string;
          type?: string;
          updated_at?: string;
        };
        Update: {
          capacity?: number | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          event_date?: string | null;
          factory_id?: string;
          id?: string;
          location?: string | null;
          name?: string;
          status?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "showrooms_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancelled_at: string | null;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          id: string;
          plan_id: string;
          status: string;
          tenant_id: string;
          tenant_type: string;
          updated_at: string;
        };
        Insert: {
          cancelled_at?: string | null;
          created_at?: string;
          current_period_end: string;
          current_period_start?: string;
          id?: string;
          plan_id: string;
          status?: string;
          tenant_id: string;
          tenant_type: string;
          updated_at?: string;
        };
        Update: {
          cancelled_at?: string | null;
          created_at?: string;
          current_period_end?: string;
          current_period_start?: string;
          id?: string;
          plan_id?: string;
          status?: string;
          tenant_id?: string;
          tenant_type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      team_members: {
        Row: {
          created_at: string;
          factory_id: string | null;
          id: string;
          is_active: boolean;
          joined_at: string;
          retailer_id: string | null;
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          factory_id?: string | null;
          id?: string;
          is_active?: boolean;
          joined_at?: string;
          retailer_id?: string | null;
          role: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          factory_id?: string | null;
          id?: string;
          is_active?: boolean;
          joined_at?: string;
          retailer_id?: string | null;
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
