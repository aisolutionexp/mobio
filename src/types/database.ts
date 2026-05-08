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
      audit_logs: {
        Row: {
          actor_user_id: string | null;
          after_data: Json | null;
          before_data: Json | null;
          created_at: string;
          id: string;
          operation: string;
          record_id: string;
          table_name: string;
        };
        Insert: {
          actor_user_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          id?: string;
          operation: string;
          record_id: string;
          table_name: string;
        };
        Update: {
          actor_user_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          id?: string;
          operation?: string;
          record_id?: string;
          table_name?: string;
        };
        Relationships: [];
      };
      authorized_retailers: {
        Row: {
          authorized_at: string;
          authorized_by: string;
          created_at: string;
          factory_id: string;
          retailer_id: string;
          revoked_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          authorized_at?: string;
          authorized_by: string;
          created_at?: string;
          factory_id: string;
          retailer_id: string;
          revoked_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          authorized_at?: string;
          authorized_by?: string;
          created_at?: string;
          factory_id?: string;
          retailer_id?: string;
          revoked_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "authorized_retailers_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "authorized_retailers_retailer_id_fkey";
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
          note: string | null;
          position: number;
          product_id: string;
        };
        Insert: {
          added_at?: string;
          added_by: string;
          board_id: string;
          id?: string;
          note?: string | null;
          position?: number;
          product_id: string;
        };
        Update: {
          added_at?: string;
          added_by?: string;
          board_id?: string;
          id?: string;
          note?: string | null;
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
      conversations: {
        Row: {
          context_id: string | null;
          context_type: string | null;
          created_at: string;
          factory_id: string;
          id: string;
          last_message_at: string | null;
          retailer_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          context_id?: string | null;
          context_type?: string | null;
          created_at?: string;
          factory_id: string;
          id?: string;
          last_message_at?: string | null;
          retailer_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          context_id?: string | null;
          context_type?: string | null;
          created_at?: string;
          factory_id?: string;
          id?: string;
          last_message_at?: string | null;
          retailer_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
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
      factory_invitations: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          expires_at: string;
          factory_id: string;
          id: string;
          invited_by: string;
          retailer_email: string;
          retailer_name: string | null;
          status: string;
          terms_snapshot: Json | null;
          token: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          expires_at?: string;
          factory_id: string;
          id?: string;
          invited_by: string;
          retailer_email: string;
          retailer_name?: string | null;
          status?: string;
          terms_snapshot?: Json | null;
          token?: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          expires_at?: string;
          factory_id?: string;
          id?: string;
          invited_by?: string;
          retailer_email?: string;
          retailer_name?: string | null;
          status?: string;
          terms_snapshot?: Json | null;
          token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "factory_invitations_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: false;
            referencedRelation: "factories";
            referencedColumns: ["id"];
          },
        ];
      };
      factory_settings: {
        Row: {
          cancellation_policy_hours: number;
          commercial_terms: Json;
          created_at: string;
          factory_id: string;
          payment_terms: Json;
          shipping_policy: Json;
          updated_at: string;
        };
        Insert: {
          cancellation_policy_hours?: number;
          commercial_terms?: Json;
          created_at?: string;
          factory_id: string;
          payment_terms?: Json;
          shipping_policy?: Json;
          updated_at?: string;
        };
        Update: {
          cancellation_policy_hours?: number;
          commercial_terms?: Json;
          created_at?: string;
          factory_id?: string;
          payment_terms?: Json;
          shipping_policy?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "factory_settings_factory_id_fkey";
            columns: ["factory_id"];
            isOneToOne: true;
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
          note: string | null;
          position: number;
          product_id: string;
        };
        Insert: {
          created_at?: string;
          custom_price?: number | null;
          id?: string;
          linesheet_id: string;
          note?: string | null;
          position?: number;
          product_id: string;
        };
        Update: {
          created_at?: string;
          custom_price?: number | null;
          id?: string;
          linesheet_id?: string;
          note?: string | null;
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
      linesheet_share_tokens: {
        Row: {
          access_count: number;
          created_at: string;
          created_by: string;
          expires_at: string | null;
          id: string;
          is_revoked: boolean;
          last_accessed_at: string | null;
          linesheet_id: string;
          token: string;
          updated_at: string;
        };
        Insert: {
          access_count?: number;
          created_at?: string;
          created_by: string;
          expires_at?: string | null;
          id?: string;
          is_revoked?: boolean;
          last_accessed_at?: string | null;
          linesheet_id: string;
          token: string;
          updated_at?: string;
        };
        Update: {
          access_count?: number;
          created_at?: string;
          created_by?: string;
          expires_at?: string | null;
          id?: string;
          is_revoked?: boolean;
          last_accessed_at?: string | null;
          linesheet_id?: string;
          token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "linesheet_share_tokens_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "linesheet_share_tokens_linesheet_id_fkey";
            columns: ["linesheet_id"];
            isOneToOne: false;
            referencedRelation: "linesheets";
            referencedColumns: ["id"];
          },
        ];
      };
      linesheets: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          factory_id: string | null;
          id: string;
          name: string;
          pricing_variant: string;
          retailer_id: string | null;
          status: string;
          target_retailer_id: string | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          factory_id?: string | null;
          id?: string;
          name: string;
          pricing_variant?: string;
          retailer_id?: string | null;
          status?: string;
          target_retailer_id?: string | null;
          type?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          factory_id?: string | null;
          id?: string;
          name?: string;
          pricing_variant?: string;
          retailer_id?: string | null;
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
            foreignKeyName: "linesheets_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
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
      message_attachments: {
        Row: {
          file_name: string;
          file_size_bytes: number;
          file_type: string;
          id: string;
          message_id: string;
          message_type: string;
          storage_path: string;
          uploaded_at: string;
          uploaded_by: string;
        };
        Insert: {
          file_name: string;
          file_size_bytes: number;
          file_type: string;
          id?: string;
          message_id: string;
          message_type: string;
          storage_path: string;
          uploaded_at?: string;
          uploaded_by: string;
        };
        Update: {
          file_name?: string;
          file_size_bytes?: number;
          file_type?: string;
          id?: string;
          message_id?: string;
          message_type?: string;
          storage_path?: string;
          uploaded_at?: string;
          uploaded_by?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          attachments: Json | null;
          body: string;
          body_tsv: unknown;
          conversation_id: string;
          created_at: string;
          deleted_at: string | null;
          edited_at: string | null;
          id: string;
          is_read: boolean;
          sender_user_id: string;
        };
        Insert: {
          attachments?: Json | null;
          body: string;
          body_tsv?: unknown;
          conversation_id: string;
          created_at?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          id?: string;
          is_read?: boolean;
          sender_user_id: string;
        };
        Update: {
          attachments?: Json | null;
          body?: string;
          body_tsv?: unknown;
          conversation_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          id?: string;
          is_read?: boolean;
          sender_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
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
      order_status_history: {
        Row: {
          changed_by: string;
          created_at: string;
          from_status: string;
          id: string;
          notes: string | null;
          order_id: string;
          to_status: string;
        };
        Insert: {
          changed_by: string;
          created_at?: string;
          from_status: string;
          id?: string;
          notes?: string | null;
          order_id: string;
          to_status: string;
        };
        Update: {
          changed_by?: string;
          created_at?: string;
          from_status?: string;
          id?: string;
          notes?: string | null;
          order_id?: string;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
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
          order_number: string | null;
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
          order_number?: string | null;
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
          order_number?: string | null;
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
      payment_records: {
        Row: {
          amount_cents: number;
          created_at: string;
          id: string;
          paid_at: string;
          payment_method: string;
          schedule_id: string;
          transaction_ref: string | null;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          id?: string;
          paid_at?: string;
          payment_method: string;
          schedule_id: string;
          transaction_ref?: string | null;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          id?: string;
          paid_at?: string;
          payment_method?: string;
          schedule_id?: string;
          transaction_ref?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_records_schedule_id_fkey";
            columns: ["schedule_id"];
            isOneToOne: false;
            referencedRelation: "payment_schedules";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_schedules: {
        Row: {
          created_at: string;
          due_date: string | null;
          id: string;
          order_id: string;
          signal_pct: number;
          status: string;
          total_cents: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          due_date?: string | null;
          id?: string;
          order_id: string;
          signal_pct?: number;
          status?: string;
          total_cents: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          due_date?: string | null;
          id?: string;
          order_id?: string;
          signal_pct?: number;
          status?: string;
          total_cents?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_schedules_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
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
          msrp: number | null;
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
          msrp?: number | null;
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
          msrp?: number | null;
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
          onboarding_completed_at: string | null;
          onboarding_step: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_path?: string | null;
          created_at?: string;
          full_name: string;
          id: string;
          onboarding_completed_at?: string | null;
          onboarding_step?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_path?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          onboarding_completed_at?: string | null;
          onboarding_step?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          auth: string;
          created_at: string;
          endpoint: string;
          id: string;
          is_active: boolean;
          last_used_at: string | null;
          p256dh: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          auth: string;
          created_at?: string;
          endpoint: string;
          id?: string;
          is_active?: boolean;
          last_used_at?: string | null;
          p256dh: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          auth?: string;
          created_at?: string;
          endpoint?: string;
          id?: string;
          is_active?: boolean;
          last_used_at?: string | null;
          p256dh?: string;
          user_agent?: string | null;
          user_id?: string;
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
      quote_messages: {
        Row: {
          attachments: Json;
          body: string;
          created_at: string;
          id: string;
          is_read: boolean;
          quote_id: string;
          sender_user_id: string;
        };
        Insert: {
          attachments?: Json;
          body: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          quote_id: string;
          sender_user_id: string;
        };
        Update: {
          attachments?: Json;
          body?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          quote_id?: string;
          sender_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quote_messages_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_messages_sender_user_id_fkey";
            columns: ["sender_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
      retailer_addresses: {
        Row: {
          address_line: string;
          city: string;
          complement: string | null;
          created_at: string;
          id: string;
          is_default: boolean;
          label: string;
          neighborhood: string;
          recipient_name: string;
          region_id: string | null;
          retailer_id: string;
          state: string;
          updated_at: string;
          zip_code: string;
        };
        Insert: {
          address_line: string;
          city: string;
          complement?: string | null;
          created_at?: string;
          id?: string;
          is_default?: boolean;
          label?: string;
          neighborhood: string;
          recipient_name: string;
          region_id?: string | null;
          retailer_id: string;
          state: string;
          updated_at?: string;
          zip_code: string;
        };
        Update: {
          address_line?: string;
          city?: string;
          complement?: string | null;
          created_at?: string;
          id?: string;
          is_default?: boolean;
          label?: string;
          neighborhood?: string;
          recipient_name?: string;
          region_id?: string | null;
          retailer_id?: string;
          state?: string;
          updated_at?: string;
          zip_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: "retailer_addresses_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "retailer_addresses_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
        ];
      };
      retailer_documents: {
        Row: {
          doc_type: string;
          file_name: string;
          id: string;
          retailer_id: string;
          storage_path: string;
          uploaded_at: string;
          uploaded_by: string;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          doc_type: string;
          file_name: string;
          id?: string;
          retailer_id: string;
          storage_path: string;
          uploaded_at?: string;
          uploaded_by: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          doc_type?: string;
          file_name?: string;
          id?: string;
          retailer_id?: string;
          storage_path?: string;
          uploaded_at?: string;
          uploaded_by?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "retailer_documents_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
        ];
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
          verification_notes: string | null;
          verification_status: string;
          verified_at: string | null;
          verified_by: string | null;
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
          verification_notes?: string | null;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
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
          verification_notes?: string | null;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
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
          {
            foreignKeyName: "retailers_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
      showroom_bookings: {
        Row: {
          confirmed_at: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          retailer_id: string;
          slot_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          confirmed_at?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          retailer_id: string;
          slot_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          confirmed_at?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          retailer_id?: string;
          slot_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "showroom_bookings_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "showroom_bookings_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: false;
            referencedRelation: "showroom_slots";
            referencedColumns: ["id"];
          },
        ];
      };
      showroom_slots: {
        Row: {
          created_at: string;
          ends_at: string;
          id: string;
          is_available: boolean;
          location_details: string | null;
          max_attendees: number;
          showroom_id: string;
          starts_at: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_at: string;
          id?: string;
          is_available?: boolean;
          location_details?: string | null;
          max_attendees?: number;
          showroom_id: string;
          starts_at: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_at?: string;
          id?: string;
          is_available?: boolean;
          location_details?: string | null;
          max_attendees?: number;
          showroom_id?: string;
          starts_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "showroom_slots_showroom_id_fkey";
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
      statements: {
        Row: {
          created_at: string;
          factory_id: string;
          fee_cents: number;
          gmv_cents: number;
          id: string;
          net_cents: number;
          orders_count: number;
          period_end: string;
          period_start: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          factory_id: string;
          fee_cents?: number;
          gmv_cents?: number;
          id?: string;
          net_cents?: number;
          orders_count?: number;
          period_end: string;
          period_start: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          factory_id?: string;
          fee_cents?: number;
          gmv_cents?: number;
          id?: string;
          net_cents?: number;
          orders_count?: number;
          period_end?: string;
          period_start?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "statements_factory_id_fkey";
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
      accept_quote: { Args: { p_quote_id: string }; Returns: string };
      custom_access_token_hook: { Args: { event: Json }; Returns: Json };
      fn_can_cancel_order: { Args: { p_order_id: string }; Returns: boolean };
      fn_generate_monthly_statements: {
        Args: { p_period_start: string };
        Returns: number;
      };
      get_admin_overview: {
        Args: never;
        Returns: {
          signups_last_30d: number;
          total_factories: number;
          total_gmv_cents: number;
          total_orders: number;
          total_retailers: number;
        }[];
      };
      get_factory_analytics: {
        Args: { p_end: string; p_factory_id: string; p_start: string };
        Returns: {
          active_retailers: number;
          avg_ticket_cents: number;
          gmv_cents: number;
          orders_count: number;
          top_products: Json;
          top_retailers: Json;
        }[];
      };
      get_linesheet_by_token: { Args: { p_token: string }; Returns: Json };
      get_retailer_analytics: {
        Args: { p_end: string; p_retailer_id: string; p_start: string };
        Returns: {
          avg_ticket_cents: number;
          orders_count: number;
          top_categories: Json;
          top_factories: Json;
          total_spent_cents: number;
        }[];
      };
      list_my_conversations: {
        Args: { p_user_id: string };
        Returns: {
          context_id: string;
          context_type: string;
          conversation_id: string;
          factory_id: string;
          last_message_at: string;
          last_message_body: string;
          retailer_id: string;
          unread_count: number;
        }[];
      };
      search_factories: {
        Args: {
          category_id_filter?: string;
          limit_count?: number;
          query_text?: string;
          region_id_filter?: string;
        };
        Returns: {
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
        }[];
        SetofOptions: {
          from: "*";
          to: "factories";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      search_messages: {
        Args: { p_conversation_id: string; p_query: string };
        Returns: {
          attachments: Json | null;
          body: string;
          body_tsv: unknown;
          conversation_id: string;
          created_at: string;
          deleted_at: string | null;
          edited_at: string | null;
          id: string;
          is_read: boolean;
          sender_user_id: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "messages";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
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
