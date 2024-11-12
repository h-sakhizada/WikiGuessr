export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      badge: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      badge_profile_junction: {
        Row: {
          badge_id: string
          badge_selected: boolean | null
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          badge_id: string
          badge_selected?: boolean | null
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          badge_id?: string
          badge_selected?: boolean | null
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_profile_junction_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_profile_junction_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon: string
          id?: number
          name?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      daily_game: {
        Row: {
          article_title: string
          created_at: string
          day_of_game: string
          id: number
        }
        Insert: {
          article_title: string
          created_at?: string
          day_of_game: string
          id?: number
        }
        Update: {
          article_title?: string
          created_at?: string
          day_of_game?: string
          id?: number
        }
        Relationships: []
      }
      daily_games: {
        Row: {
          article_id: number
          date: string
          id: number
        }
        Insert: {
          article_id: number
          date: string
          id?: number
        }
        Update: {
          article_id?: number
          date?: string
          id?: number
        }
        Relationships: []
      }
      extra_games: {
        Row: {
          article_id: number
          created_at: string | null
          game_id: number
          id: number
          original_game_id: number
          user_id: string
        }
        Insert: {
          article_id: number
          created_at?: string | null
          game_id: number
          id?: number
          original_game_id: number
          user_id: string
        }
        Update: {
          article_id?: number
          created_at?: string | null
          game_id?: number
          id?: number
          original_game_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extra_games_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "daily_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extra_games_original_game_id_fkey"
            columns: ["original_game_id"]
            isOneToOne: false
            referencedRelation: "daily_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extra_games_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_results: {
        Row: {
          attempt_date: string | null
          attempts: number | null
          game_id: number
          id: number
          result: boolean
          user_id: string
        }
        Insert: {
          attempt_date?: string | null
          attempts?: number | null
          game_id: number
          id?: number
          result: boolean
          user_id: string
        }
        Update: {
          attempt_date?: string | null
          attempts?: number | null
          game_id?: number
          id?: number
          result?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_results_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "daily_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          is_admin: boolean
          is_premium: boolean
          username: string
          victories: Json[] | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          is_admin?: boolean
          is_premium?: boolean
          username: string
          victories?: Json[] | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          is_premium?: boolean
          username?: string
          victories?: Json[] | null
        }
        Relationships: []
      }
      profile_badges: {
        Row: {
          badge_id: number
          earned_at: string | null
          profile_id: string
        }
        Insert: {
          badge_id: number
          earned_at?: string | null
          profile_id: string
        }
        Update: {
          badge_id?: number
          earned_at?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          user_id: string
          username: string
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_admin: boolean | null
          is_premium: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_admin?: boolean | null
          is_premium?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          is_premium?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
