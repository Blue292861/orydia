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
    PostgrestVersion: "12.2.3 (519615d)"
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
          is_month_success: boolean
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
          is_month_success?: boolean
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
          is_month_success?: boolean
          is_paco_favourite?: boolean
          is_premium?: boolean
          name?: string
          points?: number
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
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
          id: string
          is_month_success: boolean
          is_paco_favourite: boolean
          is_premium: boolean
          points: number
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          content: string
          cover_url: string
          created_at?: string
          id?: string
          is_month_success?: boolean
          is_paco_favourite?: boolean
          is_premium?: boolean
          points?: number
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          cover_url?: string
          created_at?: string
          id?: string
          is_month_success?: boolean
          is_paco_favourite?: boolean
          is_premium?: boolean
          points?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          category: string
          content: string | null
          created_at: string
          description: string
          id: string
          image_url: string
          name: string
          price: number
          seller: string
          updated_at: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          description: string
          id?: string
          image_url: string
          name: string
          price: number
          seller: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          name?: string
          price?: number
          seller?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: {
        Args: { experience_points: number }
        Returns: number
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
    },
  },
} as const
