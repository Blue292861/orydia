export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
      audiobooks: {
        Row: {
          audio_url: string
          author: string
          cover_url: string
          created_at: string
          description: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          first_name: string | null
          id: string
          last_name: string | null
          postal_code: string | null
          street_address: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          postal_code?: string | null
          street_address?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          postal_code?: string | null
          street_address?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          additional_images: string[] | null
          available_sizes: string[] | null
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
          sale_price: number | null
          seller: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          additional_images?: string[] | null
          available_sizes?: string[] | null
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
          sale_price?: number | null
          seller: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          additional_images?: string[] | null
          available_sizes?: string[] | null
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
          sale_price?: number | null
          seller?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
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
      [_ in never]: never
    }
    Functions: {
      calculate_level: {
        Args: { experience_points: number }
        Returns: number
      }
      get_recommended_theme: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["ui_theme"]
      }
      update_genre_preference: {
        Args: {
          p_user_id: string
          p_genre: string
          p_reading_time_minutes?: number
        }
        Returns: undefined
      }
      user_has_role: {
        Args: {
          p_user_id: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
