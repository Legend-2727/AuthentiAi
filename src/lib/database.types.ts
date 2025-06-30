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
      audio_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          tags: string[]
          audio_url: string
          script: string | null
          voice_id: string | null
          generation_type: 'ai' | 'upload'
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          tags?: string[]
          audio_url: string
          script?: string | null
          voice_id?: string | null
          generation_type: 'ai' | 'upload'
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          tags?: string[]
          audio_url?: string
          script?: string | null
          voice_id?: string | null
          generation_type?: string
          version?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audio_post_reactions: {
        Row: {
          id: string
          audio_post_id: string
          user_id: string
          reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
          created_at: string
        }
        Insert: {
          id?: string
          audio_post_id: string
          user_id: string
          reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
          created_at?: string
        }
        Update: {
          id?: string
          audio_post_id?: string
          user_id?: string
          reaction_type?: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_post_reactions_audio_post_id_fkey"
            columns: ["audio_post_id"]
            referencedRelation: "audio_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_post_reactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audio_post_comments: {
        Row: {
          id: string
          audio_post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          audio_post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          audio_post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_post_comments_audio_post_id_fkey"
            columns: ["audio_post_id"]
            referencedRelation: "audio_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_post_comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audio_threads: {
        Row: {
          id: string
          audio_post_id: string
          user_id: string
          message: string
          message_type: 'user_feedback' | 'regeneration_request' | 'system_response'
          created_at: string
        }
        Insert: {
          id?: string
          audio_post_id: string
          user_id: string
          message: string
          message_type: 'user_feedback' | 'regeneration_request' | 'system_response'
          created_at?: string
        }
        Update: {
          id?: string
          audio_post_id?: string
          user_id?: string
          message?: string
          message_type?: 'user_feedback' | 'regeneration_request' | 'system_response'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_threads_audio_post_id_fkey"
            columns: ["audio_post_id"]
            referencedRelation: "audio_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_threads_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
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
      proofs: {
        Row: {
          id: string
          user_id: string
          content_id: string | null
          content_type: string
          filename: string
          file_hash: string
          file_size: number | null
          algorand_txn_id: string
          algorand_explorer_url: string | null
          verification_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id?: string | null
          content_type: string
          filename: string
          file_hash: string
          file_size?: number | null
          algorand_txn_id: string
          algorand_explorer_url?: string | null
          verification_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string | null
          content_type?: string
          filename?: string
          file_hash?: string
          file_size?: number | null
          algorand_txn_id?: string
          algorand_explorer_url?: string | null
          verification_status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proofs_user_id_fkey"
            columns: ["user_id"]
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
          description: string | null
          script: string
          video_url: string | null
          status: string
          replica_id: string | null
          replica_type: string | null
          tavus_video_id: string | null
          tags: string[]
          thumbnail_url: string | null
          duration: number | null
          generation_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          script: string
          video_url?: string | null
          status?: string
          replica_id?: string | null
          replica_type?: string | null
          tavus_video_id?: string | null
          tags?: string[]
          thumbnail_url?: string | null
          duration?: number | null
          generation_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          script?: string
          video_url?: string | null
          status?: string
          replica_id?: string | null
          replica_type?: string | null
          tavus_video_id?: string | null
          tags?: string[]
          thumbnail_url?: string | null
          duration?: number | null
          generation_type?: string
          created_at?: string
          updated_at?: string
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