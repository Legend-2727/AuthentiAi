export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          name: string | null
          profile_img_url: string | null
          created_at: string
          status: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          name?: string | null
          profile_img_url?: string | null
          created_at?: string
          status?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          name?: string | null
          profile_img_url?: string | null
          created_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      videos: {
        Row: {
          id: string
          user_id: string
          title: string
          script: string
          video_url: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          script: string
          video_url?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          script?: string
          video_url?: string | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
  }
}