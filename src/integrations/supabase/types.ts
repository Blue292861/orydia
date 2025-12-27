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
      admin_gifts: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_persistent: boolean
          message: string
          recipient_type: string
          recipient_user_ids: string[] | null
          rewards: Json
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_persistent?: boolean
          message: string
          recipient_type: string
          recipient_user_ids?: string[] | null
          rewards?: Json
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_persistent?: boolean
          message?: string
          recipient_type?: string
          recipient_user_ids?: string[] | null
          rewards?: Json
          title?: string
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
          ending_reward_points: number | null
          id: string
          is_ending: boolean
          is_interactive: boolean
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          audiobook_id: string
          chapter_number: number
          created_at?: string
          duration_seconds?: number | null
          ending_reward_points?: number | null
          id?: string
          is_ending?: boolean
          is_interactive?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          audiobook_id?: string
          chapter_number?: number
          created_at?: string
          duration_seconds?: number | null
          ending_reward_points?: number | null
          id?: string
          is_ending?: boolean
          is_interactive?: boolean
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
          is_interactive: boolean
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
          is_interactive?: boolean
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
          is_interactive?: boolean
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
          merged_epub_url: string | null
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
          merged_epub_url?: string | null
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
          merged_epub_url?: string | null
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
          ending_reward_points: number | null
          id: string
          is_ending: boolean
          is_interactive: boolean
          title: string
          updated_at: string
        }
        Insert: {
          book_id: string
          chapter_number: number
          content: string
          created_at?: string
          ending_reward_points?: number | null
          id?: string
          is_ending?: boolean
          is_interactive?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          chapter_number?: number
          content?: string
          created_at?: string
          ending_reward_points?: number | null
          id?: string
          is_ending?: boolean
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
          is_rare: boolean
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
          is_rare?: boolean
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
          is_rare?: boolean
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
      challenge_objectives: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          id: string
          objective_name: string
          objective_type: string
          position: number | null
          target_book_id: string | null
          target_book_ids: string[] | null
          target_count: number | null
          target_genre: string | null
          target_reward_type_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          objective_name: string
          objective_type: string
          position?: number | null
          target_book_id?: string | null
          target_book_ids?: string[] | null
          target_count?: number | null
          target_genre?: string | null
          target_reward_type_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          objective_name?: string
          objective_type?: string
          position?: number | null
          target_book_id?: string | null
          target_book_ids?: string[] | null
          target_count?: number | null
          target_genre?: string | null
          target_reward_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_objectives_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_objectives_target_book_id_fkey"
            columns: ["target_book_id"]
            isOneToOne: false
            referencedRelation: "book_translation_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_objectives_target_book_id_fkey"
            columns: ["target_book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_objectives_target_reward_type_id_fkey"
            columns: ["target_reward_type_id"]
            isOneToOne: false
            referencedRelation: "reward_types"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          end_date: string
          icon: string | null
          id: string
          is_active: boolean | null
          is_guild_challenge: boolean | null
          item_rewards: Json | null
          name: string
          orydors_reward: number | null
          premium_months_reward: number | null
          start_date: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          end_date: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_guild_challenge?: boolean | null
          item_rewards?: Json | null
          name: string
          orydors_reward?: number | null
          premium_months_reward?: number | null
          start_date: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          end_date?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_guild_challenge?: boolean | null
          item_rewards?: Json | null
          name?: string
          orydors_reward?: number | null
          premium_months_reward?: number | null
          start_date?: string
          updated_at?: string | null
          xp_reward?: number | null
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
      chapter_waypoints: {
        Row: {
          cfi_range: string
          chapter_id: string
          content_audio_url: string | null
          content_image_url: string | null
          content_link_label: string | null
          content_link_url: string | null
          content_text: string | null
          created_at: string
          created_by: string | null
          id: string
          updated_at: string
          waypoint_type: string
          word_index: number | null
          word_text: string
        }
        Insert: {
          cfi_range: string
          chapter_id: string
          content_audio_url?: string | null
          content_image_url?: string | null
          content_link_label?: string | null
          content_link_url?: string | null
          content_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
          waypoint_type: string
          word_index?: number | null
          word_text: string
        }
        Update: {
          cfi_range?: string
          chapter_id?: string
          content_audio_url?: string | null
          content_image_url?: string | null
          content_link_label?: string | null
          content_link_url?: string | null
          content_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
          waypoint_type?: string
          word_index?: number | null
          word_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_waypoints_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapter_epubs"
            referencedColumns: ["id"]
          },
        ]
      }
      chest_openings: {
        Row: {
          book_id: string | null
          chest_type: string
          id: string
          month_year: string | null
          opened_at: string | null
          rewards_obtained: Json
          user_id: string
        }
        Insert: {
          book_id?: string | null
          chest_type: string
          id?: string
          month_year?: string | null
          opened_at?: string | null
          rewards_obtained: Json
          user_id: string
        }
        Update: {
          book_id?: string | null
          chest_type?: string
          id?: string
          month_year?: string | null
          opened_at?: string | null
          rewards_obtained?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chest_openings_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_translation_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chest_openings_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_item_rewards: {
        Row: {
          collection_id: string
          created_at: string | null
          id: string
          quantity: number | null
          reward_type_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          reward_type_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          reward_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_item_rewards_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_item_rewards_reward_type_id_fkey"
            columns: ["reward_type_id"]
            isOneToOne: false
            referencedRelation: "reward_types"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string | null
          description: string | null
          icon_url: string
          id: string
          is_active: boolean | null
          name: string
          orydors_reward: number | null
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_url: string
          id?: string
          is_active?: boolean | null
          name: string
          orydors_reward?: number | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_url?: string
          id?: string
          is_active?: boolean | null
          name?: string
          orydors_reward?: number | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      daily_chest_claims: {
        Row: {
          claim_date: string
          claimed_at: string | null
          config_id: string | null
          id: string
          item_quantity: number | null
          item_won_id: string | null
          orydors_won: number
          reward_type: string | null
          spin_type: string | null
          user_id: string
          xp_won: number | null
        }
        Insert: {
          claim_date?: string
          claimed_at?: string | null
          config_id?: string | null
          id?: string
          item_quantity?: number | null
          item_won_id?: string | null
          orydors_won: number
          reward_type?: string | null
          spin_type?: string | null
          user_id: string
          xp_won?: number | null
        }
        Update: {
          claim_date?: string
          claimed_at?: string | null
          config_id?: string | null
          id?: string
          item_quantity?: number | null
          item_won_id?: string | null
          orydors_won?: number
          reward_type?: string | null
          spin_type?: string | null
          user_id?: string
          xp_won?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_chest_claims_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "daily_chest_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_chest_claims_item_won_id_fkey"
            columns: ["item_won_id"]
            isOneToOne: false
            referencedRelation: "reward_types"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_chest_configs: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          is_premium_only: boolean | null
          item_pool: Json | null
          max_orydors: number
          min_orydors: number
          name: string
          start_date: string
          updated_at: string | null
          wheel_segments: Json | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_premium_only?: boolean | null
          item_pool?: Json | null
          max_orydors?: number
          min_orydors?: number
          name: string
          start_date: string
          updated_at?: string | null
          wheel_segments?: Json | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_premium_only?: boolean | null
          item_pool?: Json | null
          max_orydors?: number
          min_orydors?: number
          name?: string
          start_date?: string
          updated_at?: string | null
          wheel_segments?: Json | null
        }
        Relationships: []
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
      gem_fragments: {
        Row: {
          created_at: string | null
          fragment_count: number | null
          id: string
          premium_months_claimed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fragment_count?: number | null
          id?: string
          premium_months_claimed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fragment_count?: number | null
          id?: string
          premium_months_claimed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gift_card_transactions: {
        Row: {
          amount_used: number
          balance_after: number
          balance_before: number
          created_at: string
          gift_card_id: string
          id: string
          order_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount_used: number
          balance_after: number
          balance_before: number
          created_at?: string
          gift_card_id: string
          id?: string
          order_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount_used?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          gift_card_id?: string
          id?: string
          order_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_card_transactions_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          code: string
          created_at: string
          current_balance: number
          expires_at: string | null
          id: string
          initial_amount: number
          is_active: boolean
          personal_message: string | null
          purchaser_email: string | null
          purchaser_id: string | null
          recipient_email: string | null
          recipient_name: string | null
          stripe_payment_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_balance: number
          expires_at?: string | null
          id?: string
          initial_amount: number
          is_active?: boolean
          personal_message?: string | null
          purchaser_email?: string | null
          purchaser_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_balance?: number
          expires_at?: string | null
          id?: string
          initial_amount?: number
          is_active?: boolean
          personal_message?: string | null
          purchaser_email?: string | null
          purchaser_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      guild_announcements: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          guild_id: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          guild_id: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          guild_id?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_announcements_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_challenge_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          guild_id: string
          id: string
          is_completed: boolean | null
          objective_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          guild_id: string
          id?: string
          is_completed?: boolean | null
          objective_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          guild_id?: string
          id?: string
          is_completed?: boolean | null
          objective_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_challenge_progress_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_challenge_progress_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "challenge_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_member_ranks: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          guild_id: string
          id: string
          rank_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          guild_id: string
          id?: string
          rank_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          guild_id?: string
          id?: string
          rank_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_member_ranks_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_member_ranks_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "guild_ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_messages: {
        Row: {
          content: string
          created_at: string | null
          guild_id: string
          id: string
          is_pinned: boolean | null
          message_type: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          guild_id: string
          id?: string
          is_pinned?: boolean | null
          message_type?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          guild_id?: string
          id?: string
          is_pinned?: boolean | null
          message_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_ranks: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_name: string
          guild_id: string
          icon: string | null
          id: string
          is_active: boolean | null
          max_holders: number | null
          permissions: Json | null
          priority: number | null
          rank_type: Database["public"]["Enums"]["guild_rank_type"]
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          guild_id: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_holders?: number | null
          permissions?: Json | null
          priority?: number | null
          rank_type: Database["public"]["Enums"]["guild_rank_type"]
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          guild_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_holders?: number | null
          permissions?: Json | null
          priority?: number | null
          rank_type?: Database["public"]["Enums"]["guild_rank_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_ranks_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_vault: {
        Row: {
          aildor_keys: number | null
          created_at: string | null
          guild_id: string
          id: string
          orydors: number | null
          updated_at: string | null
        }
        Insert: {
          aildor_keys?: number | null
          created_at?: string | null
          guild_id: string
          id?: string
          orydors?: number | null
          updated_at?: string | null
        }
        Update: {
          aildor_keys?: number | null
          created_at?: string | null
          guild_id?: string
          id?: string
          orydors?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_vault_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: true
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_vault_cards: {
        Row: {
          created_at: string | null
          guild_id: string
          id: string
          quantity: number | null
          reward_type_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guild_id: string
          id?: string
          quantity?: number | null
          reward_type_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guild_id?: string
          id?: string
          quantity?: number | null
          reward_type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_vault_cards_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_vault_cards_reward_type_id_fkey"
            columns: ["reward_type_id"]
            isOneToOne: false
            referencedRelation: "reward_types"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_vault_transactions: {
        Row: {
          action: string
          created_at: string | null
          guild_id: string
          id: string
          note: string | null
          quantity: number
          recipient_id: string | null
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          guild_id: string
          id?: string
          note?: string | null
          quantity: number
          recipient_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          guild_id?: string
          id?: string
          note?: string | null
          quantity?: number
          recipient_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_vault_transactions_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          banner_url: string | null
          created_at: string | null
          creation_cost: number | null
          id: string
          is_active: boolean | null
          member_count: number | null
          name: string
          owner_id: string
          slogan: string | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          creation_cost?: number | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name: string
          owner_id: string
          slogan?: string | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          creation_cost?: number | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name?: string
          owner_id?: string
          slogan?: string | null
          updated_at?: string | null
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
      level_rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          item_rewards: Json | null
          level: number
          orydors_reward: number | null
          premium_days: number | null
          updated_at: string | null
          xp_bonus: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          item_rewards?: Json | null
          level: number
          orydors_reward?: number | null
          premium_days?: number | null
          updated_at?: string | null
          xp_bonus?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          item_rewards?: Json | null
          level?: number
          orydors_reward?: number | null
          premium_days?: number | null
          updated_at?: string | null
          xp_bonus?: number | null
        }
        Relationships: []
      }
      loot_tables: {
        Row: {
          book_id: string | null
          chest_type: string
          created_at: string | null
          drop_chance_percentage: number
          genre: string | null
          id: string
          max_quantity: number | null
          min_quantity: number | null
          reward_type_id: string | null
        }
        Insert: {
          book_id?: string | null
          chest_type: string
          created_at?: string | null
          drop_chance_percentage: number
          genre?: string | null
          id?: string
          max_quantity?: number | null
          min_quantity?: number | null
          reward_type_id?: string | null
        }
        Update: {
          book_id?: string | null
          chest_type?: string
          created_at?: string | null
          drop_chance_percentage?: number
          genre?: string | null
          id?: string
          max_quantity?: number | null
          min_quantity?: number | null
          reward_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loot_tables_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_translation_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loot_tables_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loot_tables_reward_type_id_fkey"
            columns: ["reward_type_id"]
            isOneToOne: false
            referencedRelation: "reward_types"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          created_by: string | null
          failed_count: number | null
          id: string
          sent_at: string | null
          sent_count: number | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          created_by?: string | null
          failed_count?: number | null
          id?: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          failed_count?: number | null
          id?: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_name: string
          order_number: string
          price: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_name: string
          order_number: string
          price: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_name?: string
          order_number?: string
          price?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_level_rewards: {
        Row: {
          created_at: string | null
          id: string
          level: number
          level_reward_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: number
          level_reward_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number
          level_reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_level_rewards_level_reward_id_fkey"
            columns: ["level_reward_id"]
            isOneToOne: false
            referencedRelation: "level_rewards"
            referencedColumns: ["id"]
          },
        ]
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
          newsletter_subscribed: boolean | null
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
          newsletter_subscribed?: boolean | null
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
          newsletter_subscribed?: boolean | null
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
      reader_oaths: {
        Row: {
          bonus_percentage: number
          book_cover_url: string | null
          book_id: string
          book_title: string
          created_at: string
          deadline: string
          id: string
          payout_amount: number | null
          resolved_at: string | null
          stake_amount: number
          status: string
          user_id: string
        }
        Insert: {
          bonus_percentage?: number
          book_cover_url?: string | null
          book_id: string
          book_title: string
          created_at?: string
          deadline: string
          id?: string
          payout_amount?: number | null
          resolved_at?: string | null
          stake_amount: number
          status?: string
          user_id: string
        }
        Update: {
          bonus_percentage?: number
          book_cover_url?: string | null
          book_id?: string
          book_title?: string
          created_at?: string
          deadline?: string
          id?: string
          payout_amount?: number | null
          resolved_at?: string | null
          stake_amount?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_types: {
        Row: {
          category: string
          collection_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          rarity: string
          updated_at: string | null
        }
        Insert: {
          category: string
          collection_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          rarity: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          collection_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          rarity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_types_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
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
          is_available: boolean
          is_clothing: boolean
          is_on_sale: boolean
          is_temporary: boolean | null
          name: string
          payment_type: string | null
          price: number
          product_id: string | null
          real_price_cents: number | null
          related_book_ids: string[] | null
          required_level: number | null
          reward_type_id: string | null
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
          is_available?: boolean
          is_clothing?: boolean
          is_on_sale?: boolean
          is_temporary?: boolean | null
          name: string
          payment_type?: string | null
          price: number
          product_id?: string | null
          real_price_cents?: number | null
          related_book_ids?: string[] | null
          required_level?: number | null
          reward_type_id?: string | null
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
          is_available?: boolean
          is_clothing?: boolean
          is_on_sale?: boolean
          is_temporary?: boolean | null
          name?: string
          payment_type?: string | null
          price?: number
          product_id?: string | null
          real_price_cents?: number | null
          related_book_ids?: string[] | null
          required_level?: number | null
          reward_type_id?: string | null
          sale_price?: number | null
          seller?: string
          shop_type?: Database["public"]["Enums"]["shop_type"]
          slug?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_items_reward_type_id_fkey"
            columns: ["reward_type_id"]
            isOneToOne: false
            referencedRelation: "reward_types"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_paths: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          position: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          position?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          bonus_config: Json
          bonus_type: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          path_id: string
          position: number
          skill_point_cost: number
          updated_at: string | null
        }
        Insert: {
          bonus_config: Json
          bonus_type: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          path_id: string
          position: number
          skill_point_cost?: number
          updated_at?: string | null
        }
        Update: {
          bonus_config?: Json
          bonus_type?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          path_id?: string
          position?: number
          skill_point_cost?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "skill_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_bonuses: {
        Row: {
          bonus_type: string
          bonus_value: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          streak_level: number
        }
        Insert: {
          bonus_type: string
          bonus_value: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          streak_level: number
        }
        Update: {
          bonus_type?: string
          bonus_value?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          streak_level?: number
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
      user_challenge_completions: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          id: string
          rewards_claimed: boolean | null
          rewards_claimed_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          id?: string
          rewards_claimed?: boolean | null
          rewards_claimed_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          id?: string
          rewards_claimed?: boolean | null
          rewards_claimed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_notifications: {
        Row: {
          challenge_id: string | null
          id: string
          seen_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          id?: string
          seen_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          id?: string
          seen_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_notifications_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          id: string
          is_completed: boolean | null
          objective_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          objective_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          objective_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenge_progress_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "challenge_objectives"
            referencedColumns: ["id"]
          },
        ]
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
      user_collection_completions: {
        Row: {
          chest_claimed: boolean | null
          claimed_at: string | null
          collection_id: string
          completed_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          chest_claimed?: boolean | null
          claimed_at?: string | null
          collection_id: string
          completed_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          chest_claimed?: boolean | null
          claimed_at?: string | null
          collection_id?: string
          completed_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collection_completions_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
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
      user_gift_claims: {
        Row: {
          claimed_at: string | null
          gift_id: string
          id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          gift_id: string
          id?: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          gift_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gift_claims_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "admin_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory: {
        Row: {
          acquired_at: string | null
          id: string
          quantity: number | null
          reward_type_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          id?: string
          quantity?: number | null
          reward_type_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          id?: string
          quantity?: number | null
          reward_type_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_reward_type_id_fkey"
            columns: ["reward_type_id"]
            isOneToOne: false
            referencedRelation: "reward_types"
            referencedColumns: ["id"]
          },
        ]
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
      user_rare_books: {
        Row: {
          book_id: string
          discovered_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          discovered_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          discovered_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rare_books_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_translation_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rare_books_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
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
      user_skills: {
        Row: {
          id: string
          skill_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          skill_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          skill_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          books_read: string[]
          created_at: string
          experience_points: number
          id: string
          level: number
          pending_premium_months: number
          skill_points: number
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
          skill_points?: number
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
          skill_points?: number
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
      wheel_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_spin_date: string | null
          max_streak: number | null
          streak_broken_at: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_spin_date?: string | null
          max_streak?: number | null
          streak_broken_at?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_spin_date?: string | null
          max_streak?: number | null
          streak_broken_at?: number | null
          updated_at?: string | null
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
      leaderboard_general: {
        Row: {
          avatar_url: string | null
          books_read_count: string[] | null
          experience_points: number | null
          first_name: string | null
          guild_id: string | null
          guild_name: string | null
          is_premium: boolean | null
          last_name: string | null
          level: number | null
          rank: number | null
          total_points: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_guild: {
        Row: {
          avatar_url: string | null
          books_read_count: string[] | null
          experience_points: number | null
          first_name: string | null
          guild_id: string | null
          guild_name: string | null
          guild_rank: number | null
          is_premium: boolean | null
          last_name: string | null
          level: number | null
          total_points: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_user_xp: {
        Args: { p_user_id: string; p_xp_amount: number }
        Returns: undefined
      }
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
      check_reader_oath_on_completion: {
        Args: { p_book_id: string; p_user_id: string }
        Returns: Json
      }
      cleanup_orphaned_storage_files: { Args: never; Returns: undefined }
      create_gift_card: {
        Args: {
          p_amount: number
          p_personal_message?: string
          p_purchaser_email: string
          p_purchaser_id: string
          p_recipient_email?: string
          p_recipient_name?: string
          p_stripe_payment_id?: string
        }
        Returns: {
          code: string
          id: string
        }[]
      }
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
      dissolve_guild: { Args: { p_guild_id: string }; Returns: boolean }
      generate_gift_card_code: { Args: never; Returns: string }
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
      get_user_active_oaths: {
        Args: { p_user_id?: string }
        Returns: {
          bonus_percentage: number
          book_cover_url: string
          book_id: string
          book_title: string
          created_at: string
          deadline: string
          id: string
          potential_loss: number
          potential_win: number
          stake_amount: number
          time_remaining: unknown
        }[]
      }
      get_user_active_skill_bonuses: {
        Args: { p_user_id: string }
        Returns: {
          bonus_config: Json
          bonus_type: string
          path_id: string
          path_name: string
          skill_name: string
          skill_position: number
        }[]
      }
      get_user_id_by_email: { Args: { p_email: string }; Returns: string }
      get_user_oath_history: {
        Args: { p_limit?: number; p_user_id?: string }
        Returns: {
          book_cover_url: string
          book_id: string
          book_title: string
          created_at: string
          deadline: string
          id: string
          payout_amount: number
          resolved_at: string
          stake_amount: number
          status: string
        }[]
      }
      get_user_oath_stats: { Args: { p_user_id?: string }; Returns: Json }
      get_user_skill_stats: { Args: { p_user_id: string }; Returns: Json }
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
      has_guild_permission: {
        Args: { p_guild_id: string; p_permission: string; p_user_id: string }
        Returns: boolean
      }
      is_admin: { Args: { p_user_id: string }; Returns: boolean }
      is_guild_leader: {
        Args: { p_guild_id: string; p_user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: { action_type: string; details?: Json; target_user_id?: string }
        Returns: undefined
      }
      log_security_event: {
        Args: { details?: Json; event_type: string; user_id?: string }
        Returns: undefined
      }
      place_reader_oath: {
        Args: {
          p_book_cover_url: string
          p_book_id: string
          p_book_title: string
          p_deadline: string
          p_stake_amount: number
        }
        Returns: Json
      }
      reset_revenue_and_orders: { Args: never; Returns: undefined }
      resolve_reader_oath: { Args: { p_oath_id: string }; Returns: Json }
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
      transfer_guild_leadership: {
        Args: { p_guild_id: string; p_new_leader_id: string }
        Returns: boolean
      }
      unlock_skill: {
        Args: { p_skill_id: string; p_user_id: string }
        Returns: Json
      }
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
      use_gift_card: {
        Args: {
          p_amount: number
          p_code: string
          p_order_id: string
          p_user_id: string
        }
        Returns: {
          amount_used: number
          message: string
          remaining_balance: number
          success: boolean
        }[]
      }
      user_has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      validate_gift_card: {
        Args: { p_code: string }
        Returns: {
          current_balance: number
          expires_at: string
          gift_card_id: string
          is_valid: boolean
          message: string
        }[]
      }
    }
    Enums: {
      app_role: "admin"
      guild_rank_type:
        | "guild_leader"
        | "treasurer"
        | "reading_champion"
        | "genre_champion"
        | "lore_keeper"
        | "dragon_slayer"
        | "veteran"
        | "elite"
        | "member"
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
      guild_rank_type: [
        "guild_leader",
        "treasurer",
        "reading_champion",
        "genre_champion",
        "lore_keeper",
        "dragon_slayer",
        "veteran",
        "elite",
        "member",
      ],
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
