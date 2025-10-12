// Centralized types and interfaces for the Dream Image Generator application

import { User } from '@supabase/supabase-js';

// ===== PRESET TYPES =====
export type PresetKey = "instagram" | "ghibli" | "professional" | "other";

export type AspectRatio = "1:1" | "4:5" | "16:9";

export type Preset = {
  id: PresetKey;
  label: string;
  desc?: string;
  ratio: AspectRatio;
  width: number;
  height: number;
  promptTemplate: string;
  platform?: "instagram" | "linkedin" | "youtube";
  watermark?: boolean;
  overlayText?: { placeholder: string; maxChars: number };
};

// ===== USER TYPES =====
export type AppUser = User | null;

// ===== DATABASE TYPES =====
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Profile types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdate {
  id?: string;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Prompt Library types
export interface PromptLibrary {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  category: string | null;
  is_public: boolean;
  source_prompt_id: string | null;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface PromptLibraryInsert {
  id?: string;
  user_id: string;
  title: string;
  prompt: string;
  category?: string | null;
  is_public?: boolean;
  source_prompt_id?: string | null;
  like_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PromptLibraryUpdate {
  id?: string;
  user_id?: string;
  title?: string;
  prompt?: string;
  category?: string | null;
  is_public?: boolean;
  source_prompt_id?: string | null;
  like_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Prompt Library Likes types
export interface PromptLibraryLike {
  id: string;
  user_id: string;
  prompt_library_id: string;
  created_at: string;
}

export interface PromptLibraryLikeInsert {
  id?: string;
  user_id: string;
  prompt_library_id: string;
  created_at?: string;
}

export interface PromptLibraryLikeUpdate {
  id?: string;
  user_id?: string;
  prompt_library_id?: string;
  created_at?: string;
}

// Instruments types
export interface Instrument {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

export interface InstrumentInsert {
  id?: string;
  name: string;
  type: string;
  created_at?: string;
}

export interface InstrumentUpdate {
  id?: string;
  name?: string;
  type?: string;
  created_at?: string;
}

// ===== COMPONENT PROPS TYPES =====

// Scrollable component props
export interface ScrollableProps {
  user: AppUser;
  selectedPreset: PresetKey | null;
  showEmpty: boolean;
  examplePrompts: string[];
  savedNotes: string;
  notes: string;
  generatedImages: string[];
  submittedNotes: string;
  isLoading: boolean;
  error: string;
  files: File[];
  selectedGeneratedIndex: number;
  setSelectedGeneratedIndex: (index: number) => void;
  aspectRatio: string;
  onInsertPrompt: (txt: string) => void;
  onClearResults: () => void;
}

// Fixed textarea component props
export interface FixedTextareaProps {
  files: File[];
  setFiles: (files: File[]) => void;
  notes: string;
  setNotes: (notes: string) => void;
  aspectLabel?: string;
  aspectTooltip?: string;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  user: AppUser;
  selectedPreset: PresetKey | null;
  customPreset: string;
  onResultsGenerated: (results: {
    submittedNotes: string;
    generatedImages: string[];
    savedNotes: string;
  }) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

// Auth guard component props
export interface AuthGuardProps {
  children: React.ReactNode;
}

// ===== UTILITY TYPES =====

// Toast notification type
export interface Toast {
  type: "success" | "error";
  msg: string;
}

// Image generation API types
export interface ImageGenerationPayload {
  mimeType: string;
  data: string;
}

export interface GenerateApiRequest {
  prompt: string;
  images?: ImageGenerationPayload[];
  aspectRatio: string;
}

export interface GenerateApiResponse {
  parts?: Array<{
    type: string;
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  candidates?: Array<{
    content?: {
      parts?: Array<{
        type: string;
        text?: string;
        data?: string;
        mimeType?: string;
      }>;
      type?: string;
      mimeType?: string;
    };
  }>;
}

// Preset append bridge type
export interface PresetAppend {
  text: string;
  nonce: number;
}

// ===== CONSOLIDATED DATABASE TYPE =====
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      prompt_library: {
        Row: PromptLibrary;
        Insert: PromptLibraryInsert;
        Update: PromptLibraryUpdate;
      };
      prompt_library_likes: {
        Row: PromptLibraryLike;
        Insert: PromptLibraryLikeInsert;
        Update: PromptLibraryLikeUpdate;
      };
      instruments: {
        Row: Instrument;
        Insert: InstrumentInsert;
        Update: InstrumentUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}