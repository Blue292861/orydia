export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ad_views: {
        Row: {
          ad_type: string
          id: string
          tensens_earned: number
          user_id: string
          viewed_at: string
        }
        Insert: {
          ad_type?: string
          id?: string
          tensens_earned?: number
          user_id: string
          viewed_at?: string
        }
        Update: {
          ad_type?: string
          id?: string
          tensens_earned?: number
          user_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          app_name: string
          created_at: string
          id: string
          is_active: boolean
          key_hash: string
          key_name: string
          last_used_at: string | null
          permissions: string[]
          usage_count: number
        }
        Insert: {
          app_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash: string
          key_name: string
          last_used_at?: string | null
          permissions?: string[]
          usage_count?: number
        }
        Update: {
          app_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash?: string
          key_name?: string
          last_used_at?: string | null
          permissions?: string[]
          usage_count?: number
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      applied_discounts: {
        Row: {
          applied_at: string
          bundle_deal_id: string | null
          discount_amount: number
          id: string
          order_id: string
        }
        Insert: {
          applied_at?: string
          bundle_deal_id?: string | null
          discount_amount: number
          id?: string
          order_id: string
        }
        Update: {
          applied_at?: string
          bundle_deal_id?: string | null
          discount_amount?: number
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applied_discounts_bundle_deal_id_fkey"
            columns: ["bundle_deal_id"]
            isOneToOne: false
            referencedRelation: "bundle_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      audiobook_chapters: {
        Row: {
          audio_url: string
          audiobook_id: string
          chapter_number: number
          created_at: string
          duration_seconds: number | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          audiobook_id: string
          chapter_number: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          audiobook_id?: string
          chapter_number?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audiobook_chapters_audiobook_id_fkey"
            columns: ["audiobook_id"]
            isOneToOne: false
            referencedRelation: "audiobooks"
            referencedColumns: ["id"]
          },
        ]
      }
      audiobook_progress: {
        Row: {
          audiobook_id: string
          chapter_id: string
          created_at: string
          current_time_seconds: number
          id: string
          is_completed: boolean
          last_played_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audiobook_id: string
          chapter_id: string
          created_at?: string
          current_time_seconds?: number
          id?: string
          is_completed?: boolean
          last_played_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audiobook_id?: string
          chapter_id?: string
          created_at?: string
          current_time_seconds?: number
          id?: string
          is_completed?: boolean
          last_played_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audiobook_progress_audiobook_id_fkey"
            columns: ["audiobook_id"]
            isOneToOne: false
            referencedRelation: "audiobooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiobook_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "audiobook_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      audiobooks: {
        Row: {
          audio_url: string
          author: string
          cover_url: string
          created_at: string
          description: string | null
          genre: string | null
          genres: string[]
          id: string
          is_featured: boolean
          is_month_success: boolean
          is_paco_chronicle: boolean
          is_paco_favourite: boolean
          is_premium: boolean
          name: string
          points: number
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          audio_url: string
          author: string
          cover_url: string
          created_at?: string
          description?: string | null
          genre?: string | null
          genres?: string[]
          id?: string
          is_featured?: boolean
          is_month_success?: boolean
          is_paco_chronicle?: boolean
          is_paco_favourite?: boolean
          is_premium?: boolean
          name: string
          points?: number
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          audio_url?: string
          author?: string
          cover_url?: string
          created_at?: string
          description?: string | null
          genre?: string | null
          genres?: string[]
          id?: string
          is_featured?: boolean
          is_month_success?: boolean
          is_paco_chronicle?: boolean
          is_paco_favourite?: boolean
          is_premium?: boolean
          name?: string
          points?: number
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      book_chapter_epubs: {
        Row: {
          book_id: string
          chapter_number: number
          created_at: string
          description: string | null
          epub_url: string
          id: string
          illustration_url: string | null
          opf_url: string | null
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          book_id: string
          chapter_number: number
          created_at?: string
          description?: string | null
          epub_url: string
          id?: string
          illustration_url?: string | null
          opf_url?: string | null
          position: number
          title: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          chapter_number?: number
          created_at?: string
          description?: string | null
          epub_url?: string
          id?: string
          illustration_url?: string | null
          opf_url?: string | null
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_chapter_epubs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_translation_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_chapter_epubs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_chapters: {
        Row: {
          book_id: string
          chapter_number: number
          content: string
          created_at: string
          id: string
          is_interactive: boolean
          title: string
          updated_at: string
        }
        Insert: {
          book_id: string
          chapter_number: number
          content: string
          created_at?: string
          id?: string
          is_interactive?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          chapter_number?: number
          content?: string
          created_at?: string
          id?: string
          is_interactive?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_translation_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_completions: {
        Row: {
          book_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string
          content: string
          cover_url: string
          created_at: string
          genres: string[]
          has_chapters: boolean
          id: string
          is_adult_content: boolean
          is_interactive: boolean
          is_month_success: boolean
          is_paco_favourite: boolean
          is_premium: boolean
          points: number
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          content: string
          cover_url: string
          created_at?: string
          genres?: string[]
          has_chapters?: boolean
          id?: string
          is_adult_content?: boolean
          is_interactive?: boolean
          is_month_success?: boolean
          is_paco_favourite?: boolean
          is_premium?: boolean
          points?: number
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          cover_url?: string
          created_at?: string
          genres?: string[]
          has_chapters?: boolean
          id?: string
          is_adult_content?: boolean
          is_interactive?: boolean
          is_month_success?: boolean
          is_paco_favourite?: boolean
          is_premium?: boolean
          points?: number
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bundle_deals: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number
          id: string
          is_active: boolean
          name: string
          product_ids: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage: number
          id?: string
          is_active?: boolean
          name: string
          product_ids: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          name?: string
          product_ids?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      chapter_translations: {
        Row: {
          chapter_id: string
          content_hash: string | null
          created_at: string
          error_message: string | null
          id: string
          language: string
          status: string
          translated_content: Json
          updated_at: string
        }
        Insert: {
          chapter_id: string
          content_hash?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          language: string
          status?: string
          translated_content: Json
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          content_hash?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          language?: string
          status?: string
          translated_content?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_translations_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapter_epubs"
            referencedColumns: ["id"]
          },
        ]
      }
      epub_reading_progress: {
        Row: {
          book_id: string
          created_at: string
          current_page: number | null
          id: string
          location: string | null
          progress: number | null
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          current_page?: number | null
          id?: string
          location?: string | null
          progress?: number | null
          total_pages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          current_page?: number | null
          id?: string
          location?: string | null
          progress?: number | null
          total_pages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_chapters: {
        Row: {
          chapter_number: number
          content: string
          created_at: string
          ending_reward_points: number | null
          game_id: string
          id: string
          is_ending: boolean
          title: string
          updated_at: string
        }
        Insert: {
          chapter_number: number
          content: string
          created_at?: string
          ending_reward_points?: number | null
          game_id: string
          id?: string
          is_ending?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          chapter_number?: number
          content?: string
          created_at?: string
          ending_reward_points?: number | null
          game_id?: string
          id?: string
          is_ending?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_chapters_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_choices: {
        Row: {
          chapter_id: string
          choice_text: string
          created_at: string
          id: string
          next_chapter_id: string | null
          points_reward: number
        }
        Insert: {
          chapter_id: string
          choice_text: string
          created_at?: string
          id?: string
          next_chapter_id?: string | null
          points_reward?: number
        }
        Update: {
          chapter_id?: string
          choice_text?: string
          created_at?: string
          id?: string
          next_chapter_id?: string | null
          points_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_choices_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "game_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_choices_next_chapter_id_fkey"
            columns: ["next_chapter_id"]
            isOneToOne: false
            referencedRelation: "game_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          author: string
          cover_url: string
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          name: string
          points_reward: number
          updated_at: string
        }
        Insert: {
          author: string
          cover_url: string
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          name: string
          points_reward?: number
          updated_at?: string
        }
        Update: {
          author?: string
          cover_url?: string
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          points_reward?: number
          updated_at?: string
        }
        Relationships: []
      }
      interactive_choices: {
        Row: {
          chapter_id: string
          choice_text: string
          consequence_text: string | null
          created_at: string
          id: string
          next_chapter_id: string | null
          points_modifier: number | null
        }
        Insert: {
          chapter_id: string
          choice_text: string
          consequence_text?: string | null
          created_at?: string
          id?: string
          next_chapter_id?: string | null
          points_modifier?: number | null
        }
        Update: {
          chapter_id?: string
          choice_text?: string
          consequence_text?: string | null
          created_at?: string
          id?: string
          next_chapter_id?: string | null
          points_modifier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "interactive_choices_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactive_choices_next_chapter_id_fkey"
            columns: ["next_chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_name: string
          price: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_name: string
          price: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_name?: string
          price?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          reference_id: string | null
          source_app: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          source_app?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          source_app?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      premium_code_redemptions: {
        Row: {
          code_id: string
          id: string
          months_granted: number
          redeemed_at: string
          subscription_type: string
          user_id: string
        }
        Insert: {
          code_id: string
          id?: string
          months_granted: number
          redeemed_at?: string
          subscription_type: string
          user_id: string
        }
        Update: {
          code_id?: string
          id?: string
          months_granted?: number
          redeemed_at?: string
          subscription_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_code_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "premium_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          current_uses: number
          duration_months: number
          expires_at: string | null
          id: string
          is_single_use: boolean
          max_uses: number | null
          subscription_type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          current_uses?: number
          duration_months?: number
          expires_at?: string | null
          id?: string
          is_single_use?: boolean
          max_uses?: number | null
          subscription_type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          current_uses?: number
          duration_months?: number
          expires_at?: string | null
          id?: string
          is_single_use?: boolean
          max_uses?: number | null
          subscription_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          app_rating: number | null
          avatar_url: string | null
          city: string | null
          country: string | null
          first_name: string | null
          has_rated_app: boolean | null
          id: string
          last_name: string | null
          postal_code: string | null
          rated_at: string | null
          tutorials_seen: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          app_rating?: number | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          first_name?: string | null
          has_rated_app?: boolean | null
          id: string
          last_name?: string | null
          postal_code?: string | null
          rated_at?: string | null
          tutorials_seen?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          app_rating?: number | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          first_name?: string | null
          has_rated_app?: boolean | null
          id?: string
          last_name?: string | null
          postal_code?: string | null
          rated_at?: string | null
          tutorials_seen?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      promo_code_redemptions: {
        Row: {
          discount_applied: number
          id: string
          order_id: string | null
          promo_code_id: string | null
          redeemed_at: string | null
          user_id: string | null
        }
        Insert: {
          discount_applied: number
          id?: string
          order_id?: string | null
          promo_code_id?: string | null
          redeemed_at?: string | null
          user_id?: string | null
        }
        Update: {
          discount_applied?: number
          id?: string
          order_id?: string | null
          promo_code_id?: string | null
          redeemed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          expiration_date: string | null
          id: string
          is_active: boolean | null
          is_single_use: boolean | null
          max_uses: number | null
          minimum_purchase_amount: number | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          is_single_use?: boolean | null
          max_uses?: number | null
          minimum_purchase_amount?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          is_single_use?: boolean | null
          max_uses?: number | null
          minimum_purchase_amount?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limit_log: {
        Row: {
          action_type: string
          created_at: string
          id: string
          ip_address: unknown
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          user_id?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          additional_images: string[] | null
          available_sizes: string[] | null
          categories: string[] | null
          category: string
          content: string | null
          created_at: string
          description: string
          id: string
          image_url: string
          is_clothing: boolean
          is_on_sale: boolean
          is_temporary: boolean | null
          name: string
          price: number
          product_id: string | null
          related_book_ids: string[] | null
          required_level: number | null
          sale_price: number | null
          seller: string
          shop_type: Database["public"]["Enums"]["shop_type"]
          slug: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          additional_images?: string[] | null
          available_sizes?: string[] | null
          categories?: string[] | null
          category: string
          content?: string | null
          created_at?: string
          description: string
          id?: string
          image_url: string
          is_clothing?: boolean
          is_on_sale?: boolean
          is_temporary?: boolean | null
          name: string
          price: number
          product_id?: string | null
          related_book_ids?: string[] | null
          required_level?: number | null
          sale_price?: number | null
          seller: string
          shop_type?: Database["public"]["Enums"]["shop_type"]
          slug: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          additional_images?: string[] | null
          available_sizes?: string[] | null
          categories?: string[] | null
          category?: string
          content?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_clothing?: boolean
          is_on_sale?: boolean
          is_temporary?: boolean | null
          name?: string
          price?: number
          product_id?: string | null
          related_book_ids?: string[] | null
          required_level?: number | null
          sale_price?: number | null
          seller?: string
          shop_type?: Database["public"]["Enums"]["shop_type"]
          slug?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          cancel_at_period_end: boolean | null
          cancellation_date: string | null
          cancelled_by_user: boolean | null
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          cancellation_date?: string | null
          cancelled_by_user?: boolean | null
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          cancellation_date?: string | null
          cancelled_by_user?: boolean | null
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tensens_code_redemptions: {
        Row: {
          code_id: string
          id: string
          points_awarded: number
          redeemed_at: string
          user_id: string
        }
        Insert: {
          code_id: string
          id?: string
          points_awarded: number
          redeemed_at?: string
          user_id: string
        }
        Update: {
          code_id?: string
          id?: string
          points_awarded?: number
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tensens_code_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "tensens_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      tensens_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          current_uses: number
          expires_at: string | null
          id: string
          is_single_use: boolean
          max_uses: number | null
          points_value: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          is_single_use?: boolean
          max_uses?: number | null
          points_value: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          is_single_use?: boolean
          max_uses?: number | null
          points_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      translation_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          message: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
          title: string
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      translation_budget: {
        Row: {
          alert_threshold_pct: number
          budget_usd: number
          created_at: string
          id: string
          is_active: boolean
          month_year: string
          spent_usd: number
          updated_at: string
        }
        Insert: {
          alert_threshold_pct?: number
          budget_usd?: number
          created_at?: string
          id?: string
          is_active?: boolean
          month_year: string
          spent_usd?: number
          updated_at?: string
        }
        Update: {
          alert_threshold_pct?: number
          budget_usd?: number
          created_at?: string
          id?: string
          is_active?: boolean
          month_year?: string
          spent_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      translation_jobs: {
        Row: {
          book_id: string
          completed_at: string | null
          completed_chapters: number | null
          created_at: string
          error_message: string | null
          failed_chapters: number | null
          id: string
          metadata: Json | null
          started_at: string | null
          status: string
          target_languages: string[]
          total_chapters: number
          updated_at: string
        }
        Insert: {
          book_id: string
          completed_at?: string | null
          completed_chapters?: number | null
          created_at?: string
          error_message?: string | null
          failed_chapters?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          target_languages: string[]
          total_chapters: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          completed_at?: string | null
          completed_chapters?: number | null
          created_at?: string
          error_message?: string | null
          failed_chapters?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          target_languages?: string[]
          total_chapters?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_jobs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_translation_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_jobs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_metrics: {
        Row: {
          chapter_id: string | null
          cost_usd: number | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          job_id: string | null
          language: string
          metadata: Json | null
          retries: number | null
          status: string
          tokens_used: number | null
        }
        Insert: {
          chapter_id?: string | null
          cost_usd?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          job_id?: string | null
          language: string
          metadata?: Json | null
          retries?: number | null
          status: string
          tokens_used?: number | null
        }
        Update: {
          chapter_id?: string | null
          cost_usd?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          job_id?: string | null
          language?: string
          metadata?: Json | null
          retries?: number | null
          status?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "translation_metrics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapter_epubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_metrics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "translation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_themes: {
        Row: {
          accent_color: string
          background_color: string
          created_at: string
          description: string | null
          font_family: string
          id: string
          name: string
          primary_color: string
          secondary_color: string
          text_color: string
          theme_key: Database["public"]["Enums"]["ui_theme"]
          updated_at: string
          vocabulary: Json
        }
        Insert: {
          accent_color: string
          background_color: string
          created_at?: string
          description?: string | null
          font_family: string
          id?: string
          name: string
          primary_color: string
          secondary_color: string
          text_color: string
          theme_key: Database["public"]["Enums"]["ui_theme"]
          updated_at?: string
          vocabulary?: Json
        }
        Update: {
          accent_color?: string
          background_color?: string
          created_at?: string
          description?: string | null
          font_family?: string
          id?: string
          name?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          theme_key?: Database["public"]["Enums"]["ui_theme"]
          updated_at?: string
          vocabulary?: Json
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          description: string
          icon: string
          id: string
          name: string
          points: number
          premium_months: number | null
          rarity: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          description: string
          icon: string
          id?: string
          name: string
          points: number
          premium_months?: number | null
          rarity: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number
          premium_months?: number | null
          rarity?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_chapter_progress: {
        Row: {
          book_id: string
          chapter_id: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_chapter_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_translation_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_chapter_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_chapter_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_epub_chapter_progress: {
        Row: {
          book_id: string
          chapter_id: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_epub_chapter_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_translation_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_epub_chapter_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_epub_chapter_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapter_epubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          added_at: string | null
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_genre_preferences: {
        Row: {
          created_at: string
          genre: string
          id: string
          last_read_at: string | null
          preference_score: number
          read_count: number
          total_time_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          genre: string
          id?: string
          last_read_at?: string | null
          preference_score?: number
          read_count?: number
          total_time_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          genre?: string
          id?: string
          last_read_at?: string | null
          preference_score?: number
          read_count?: number
          total_time_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_level_info: {
        Row: {
          created_at: string | null
          current_xp: number | null
          experience_points: number | null
          level: number | null
          level_title: string | null
          next_level_xp: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_xp?: number | null
          experience_points?: number | null
          level?: number | null
          level_title?: string | null
          next_level_xp?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_xp?: number | null
          experience_points?: number | null
          level?: number | null
          level_title?: string | null
          next_level_xp?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          books_read: string[]
          created_at: string
          experience_points: number
          id: string
          level: number
          pending_premium_months: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          books_read?: string[]
          created_at?: string
          experience_points?: number
          id?: string
          level?: number
          pending_premium_months?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          books_read?: string[]
          created_at?: string
          experience_points?: number
          id?: string
          level?: number
          pending_premium_months?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_story_choices: {
        Row: {
          book_id: string
          chapter_id: string
          choice_id: string
          chosen_at: string
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id: string
          choice_id: string
          chosen_at?: string
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string
          choice_id?: string
          chosen_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_story_choices_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_translation_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_story_choices_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_story_choices_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_story_choices_choice_id_fkey"
            columns: ["choice_id"]
            isOneToOne: false
            referencedRelation: "interactive_choices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_theme_preferences: {
        Row: {
          admin_override_theme: Database["public"]["Enums"]["ui_theme"] | null
          auto_theme_enabled: boolean
          created_at: string
          current_theme: Database["public"]["Enums"]["ui_theme"]
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_override_theme?: Database["public"]["Enums"]["ui_theme"] | null
          auto_theme_enabled?: boolean
          created_at?: string
          current_theme?: Database["public"]["Enums"]["ui_theme"]
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_override_theme?: Database["public"]["Enums"]["ui_theme"] | null
          auto_theme_enabled?: boolean
          created_at?: string
          current_theme?: Database["public"]["Enums"]["ui_theme"]
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      book_translation_status: {
        Row: {
          author: string | null
          id: string | null
          title: string | null
          total_chapters: number | null
          translated_chapter_count: number | null
          translation_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_exponential_level: {
        Args: { xp_points: number }
        Returns: {
          current_xp: number
          level: number
          level_title: string
          next_level_xp: number
        }[]
      }
      calculate_level: { Args: { experience_points: number }; Returns: number }
      check_and_create_budget_alert: { Args: never; Returns: undefined }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_max_attempts?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_orphaned_storage_files: { Args: never; Returns: undefined }
      create_instant_order: {
        Args: { p_item_id: string; p_item_name: string; p_price: number }
        Returns: string
      }
      create_pending_order: {
        Args: {
          p_item_id: string
          p_item_name: string
          p_price: number
          p_user_id: string
        }
        Returns: string
      }
      get_current_month_budget: {
        Args: never
        Returns: {
          alert_threshold_pct: number
          budget_usd: number
          id: string
          is_over_threshold: boolean
          month_year: string
          remaining_usd: number
          spent_usd: number
        }[]
      }
      get_recommended_theme: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["ui_theme"]
      }
      grant_manual_premium: {
        Args: { p_months?: number; p_user_id: string }
        Returns: undefined
      }
      grant_manual_premium_by_email_secure: {
        Args: { p_email: string; p_months?: number }
        Returns: undefined
      }
      grant_manual_premium_secure: {
        Args: { p_months?: number; p_user_id: string }
        Returns: undefined
      }
      log_admin_action: {
        Args: { action_type: string; details?: Json; target_user_id?: string }
        Returns: undefined
      }
      log_security_event: {
        Args: { details?: Json; event_type: string; user_id?: string }
        Returns: undefined
      }
      reset_revenue_and_orders: { Args: never; Returns: undefined }
      revoke_manual_premium: { Args: { p_user_id: string }; Returns: undefined }
      revoke_manual_premium_by_email_secure: {
        Args: { p_email: string }
        Returns: undefined
      }
      revoke_manual_premium_secure: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      search_user_emails: {
        Args: { p_query: string }
        Returns: {
          email: string
        }[]
      }
      sync_user_level_info: { Args: never; Returns: undefined }
      update_genre_preference: {
        Args: {
          p_genre: string
          p_reading_time_minutes?: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_translation_budget_spent: {
        Args: { cost_amount: number }
        Returns: boolean
      }
      user_has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      shop_type: "internal" | "external"
      ui_theme:
        | "medieval_fantasy"
        | "science_fiction"
        | "slice_of_life"
        | "romance"
        | "western"
        | "default"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      shop_type: ["internal", "external"],
      ui_theme: [
        "medieval_fantasy",
        "science_fiction",
        "slice_of_life",
        "romance",
        "western",
        "default",
      ],
    },
  },
} as const
