export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          query?: string
          variables?: Json
          extensions?: Json
          operationName?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audio_post_comments: {
        Row: {
          audio_post_id: string | null
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audio_post_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audio_post_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_post_comments_audio_post_id_fkey"
            columns: ["audio_post_id"]
            isOneToOne: false
            referencedRelation: "audio_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_post_reactions: {
        Row: {
          audio_post_id: string | null
          created_at: string | null
          id: string
          reaction_type: string
          user_id: string | null
        }
        Insert: {
          audio_post_id?: string | null
          created_at?: string | null
          id?: string
          reaction_type: string
          user_id?: string | null
        }
        Update: {
          audio_post_id?: string | null
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_post_reactions_audio_post_id_fkey"
            columns: ["audio_post_id"]
            isOneToOne: false
            referencedRelation: "audio_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_posts: {
        Row: {
          audio_url: string
          created_at: string | null
          description: string | null
          generation_type: string
          id: string
          script: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          version: number | null
          voice_id: string | null
        }
        Insert: {
          audio_url: string
          created_at?: string | null
          description?: string | null
          generation_type: string
          id?: string
          script?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          version?: number | null
          voice_id?: string | null
        }
        Update: {
          audio_url?: string
          created_at?: string | null
          description?: string | null
          generation_type?: string
          id?: string
          script?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: number | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_threads: {
        Row: {
          audio_post_id: string
          created_at: string | null
          id: string
          message: string
          message_type: string
          user_id: string
        }
        Insert: {
          audio_post_id: string
          created_at?: string | null
          id?: string
          message: string
          message_type: string
          user_id: string
        }
        Update: {
          audio_post_id?: string
          created_at?: string | null
          id?: string
          message?: string
          message_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_threads_audio_post_id_fkey"
            columns: ["audio_post_id"]
            isOneToOne: false
            referencedRelation: "audio_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_versions: {
        Row: {
          audio_post_id: string
          audio_url: string
          changes_description: string | null
          created_at: string | null
          id: string
          script: string | null
          version_number: number
          voice_id: string | null
        }
        Insert: {
          audio_post_id: string
          audio_url: string
          changes_description?: string | null
          created_at?: string | null
          id?: string
          script?: string | null
          version_number: number
          voice_id?: string | null
        }
        Update: {
          audio_post_id?: string
          audio_url?: string
          changes_description?: string | null
          created_at?: string | null
          id?: string
          script?: string | null
          version_number?: number
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_versions_audio_post_id_fkey"
            columns: ["audio_post_id"]
            isOneToOne: false
            referencedRelation: "audio_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          like_count: number | null
          parent_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          bio: string | null
          created_at: string | null
          display_name: string
          follower_count: number | null
          following_count: number | null
          id: string
          profile_img_url: string | null
          user_id: string | null
          username: string
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_name: string
          follower_count?: number | null
          following_count?: number | null
          id?: string
          profile_img_url?: string | null
          user_id?: string | null
          username: string
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_name?: string
          follower_count?: number | null
          following_count?: number | null
          id?: string
          profile_img_url?: string | null
          user_id?: string | null
          username?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          content_url: string
          created_at: string | null
          creator_id: string
          description: string | null
          duration: number
          id: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          content_url: string
          created_at?: string | null
          creator_id: string
          description?: string | null
          duration: number
          id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          content_url?: string
          created_at?: string | null
          creator_id?: string
          description?: string | null
          duration?: number
          id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      proofs: {
        Row: {
          algorand_explorer_url: string | null
          algorand_txn_id: string
          content_id: string | null
          content_type: string
          created_at: string | null
          file_hash: string
          file_size: number | null
          filename: string
          id: string
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          algorand_explorer_url?: string | null
          algorand_txn_id: string
          content_id?: string | null
          content_type: string
          created_at?: string | null
          file_hash: string
          file_size?: number | null
          filename: string
          id?: string
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          algorand_explorer_url?: string | null
          algorand_txn_id?: string
          content_id?: string | null
          content_type?: string
          created_at?: string | null
          file_hash?: string
          file_size?: number | null
          filename?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      star_balances: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      star_donations: {
        Row: {
          created_at: string | null
          from_user_id: string
          id: string
          message: string | null
          post_id: string
          star_count: number
          to_user_id: string
        }
        Insert: {
          created_at?: string | null
          from_user_id: string
          id?: string
          message?: string | null
          post_id: string
          star_count: number
          to_user_id: string
        }
        Update: {
          created_at?: string | null
          from_user_id?: string
          id?: string
          message?: string | null
          post_id?: string
          star_count?: number
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "star_donations_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "star_donations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "star_donations_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      star_purchases: {
        Row: {
          amount_usd: number
          created_at: string
          currency: string
          id: string
          package_identifier: string
          purchase_status: string
          revenuecat_data: Json | null
          revenuecat_transaction_id: string
          stars_purchased: number
          user_id: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          currency?: string
          id?: string
          package_identifier: string
          purchase_status?: string
          revenuecat_data?: Json | null
          revenuecat_transaction_id: string
          stars_purchased: number
          user_id: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          currency?: string
          id?: string
          package_identifier?: string
          purchase_status?: string
          revenuecat_data?: Json | null
          revenuecat_transaction_id?: string
          stars_purchased?: number
          user_id?: string
        }
        Relationships: []
      }
      star_transactions: {
        Row: {
          content_id: string | null
          content_type: string | null
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          stars_given: number
          to_user_id: string
        }
        Insert: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          stars_given?: number
          to_user_id: string
        }
        Update: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          stars_given?: number
          to_user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          profile_img_url: string | null
          status: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          profile_img_url?: string | null
          status?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          profile_img_url?: string | null
          status?: string | null
          username?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          generation_type: string
          id: string
          replica_id: string | null
          replica_type: string | null
          script: string
          status: string
          tags: string[] | null
          tavus_video_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          generation_type?: string
          id?: string
          replica_id?: string | null
          replica_type?: string | null
          script: string
          status?: string
          tags?: string[] | null
          tavus_video_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          generation_type?: string
          id?: string
          replica_id?: string | null
          replica_type?: string | null
          script?: string
          status?: string
          tags?: string[] | null
          tavus_video_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          generation_type: string | null
          id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          user_email: string | null
          user_name: string | null
          video_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_stars_from_purchase: {
        Args: {
          p_revenuecat_data?: Json
          p_user_id: string
          p_stars_to_add: number
          p_amount_usd: number
          p_package_identifier: string
          p_revenuecat_transaction_id: string
        }
        Returns: Json
      }
      process_star_transaction: {
        Args: {
          p_from_user_id: string
          p_to_user_id: string
          p_content_id?: string
          p_content_type?: string
          p_stars_given?: number
          p_message?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
