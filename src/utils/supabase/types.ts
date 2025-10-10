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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prompt_library: {
        Row: {
          id: string
          user_id: string
          title: string
          prompt: string
          category: string | null
          is_public: boolean
          source_prompt_id: string | null
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          prompt: string
          category?: string | null
          is_public?: boolean
          source_prompt_id?: string | null
          like_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          prompt?: string
          category?: string | null
          is_public?: boolean
          source_prompt_id?: string | null
          like_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      prompt_library_likes: {
        Row: {
          id: string
          user_id: string
          prompt_library_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_library_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_library_id?: string
          created_at?: string
        }
      }
      instruments: {
        Row: {
          id: string
          name: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          created_at?: string
        }
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
