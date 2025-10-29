// Advanced Preset System Types
// Supports detailed, component-based image generation presets

// ===== COMMON TYPES =====
export type AspectRatioExtended = '1:1' | '4:5' | '16:9' | '9:16' | '3:2' | '2:3' | '21:9';

export type PresetCategory = 
  | 'youtube_thumbnail'
  | 'instagram_post'
  | 'instagram_story'
  | 'product_photo'
  | 'portrait'
  | 'landscape'
  | 'logo'
  | 'banner'
  | 'ad_creative'
  | 'book_cover'
  | 'custom';

// ===== COMPONENT CONFIGURATION TYPES =====

// Subject configuration
export interface SubjectConfig {
  type: 'person' | 'object' | 'character' | 'animal' | 'none';
  description: string;
  expression?: 'excited' | 'serious' | 'happy' | 'angry' | 'surprised' | 'neutral' | 'custom';
  customExpression?: string;
  position: 'center' | 'left' | 'right' | 'top' | 'bottom';
  size: 'large' | 'medium' | 'small';
  angle?: 'front' | 'side' | 'three-quarter' | 'back';
  detail?: string; // Additional specific details
}

// Title/Text configuration
export interface TitleConfig {
  enabled: boolean;
  text?: string; // Placeholder or actual text
  style: 'bold' | 'modern' | 'retro' | 'minimal' | 'gaming' | 'elegant' | 'custom';
  customStyle?: string;
  color: 'red' | 'yellow' | 'white' | 'black' | 'blue' | 'gradient' | 'custom';
  customColor?: string;
  position: 'top' | 'center' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  alignment: 'left' | 'center' | 'right';
  fontSize: 'large' | 'medium' | 'small';
  effect?: 'shadow' | 'outline' | 'glow' | 'none';
  font?: string; // Font family description
}

// Background configuration
export interface BackgroundConfig {
  type: 'gradient' | 'solid' | 'pattern' | 'image' | 'blur' | 'transparent';
  style?: 'vibrant' | 'dark' | 'light' | 'professional' | 'gaming' | 'minimal' | 'busy';
  colors?: string[]; // Array of color codes
  description?: string; // Additional background details
  texture?: 'smooth' | 'grainy' | 'rough' | 'glossy';
}

// Effects configuration
export interface EffectsConfig {
  blur?: 'none' | 'subtle' | 'heavy';
  glow?: 'none' | 'soft' | 'strong';
  vignette?: boolean;
  grain?: boolean;
  colorGrading?: 'warm' | 'cool' | 'neutral' | 'vintage' | 'cinematic';
  contrast?: 'low' | 'normal' | 'high';
  saturation?: 'low' | 'normal' | 'high' | 'vibrant';
}

// Additional elements (overlays, badges, etc.)
export interface AdditionalElement {
  type: 'badge' | 'icon' | 'logo' | 'arrow' | 'emoji' | 'shape';
  description: string;
  position: string;
  size?: 'small' | 'medium' | 'large';
}

// ===== CATEGORY-SPECIFIC CONFIGS =====

// YouTube Thumbnail specific
export interface YouTubeThumbnailConfig {
  subject: SubjectConfig;
  title: TitleConfig;
  background: BackgroundConfig;
  effects: EffectsConfig;
  mood: 'energetic' | 'calm' | 'mysterious' | 'professional' | 'playful' | 'dramatic';
  style: 'realistic' | 'cartoon' | '3d' | 'flat' | 'painterly' | 'photographic';
  lighting: 'dramatic' | 'soft' | 'bright' | 'moody' | 'natural' | 'studio';
  additionalElements?: AdditionalElement[];
  clickbait?: boolean; // Emphasize excitement/curiosity
}

// Instagram Post specific
export interface InstagramPostConfig {
  subject: SubjectConfig;
  background: BackgroundConfig;
  effects: EffectsConfig;
  style: 'minimal' | 'vibrant' | 'aesthetic' | 'lifestyle' | 'professional' | 'vintage';
  mood: 'happy' | 'calm' | 'energetic' | 'elegant' | 'fun';
  filter?: 'none' | 'warm' | 'cool' | 'vintage' | 'bright' | 'muted';
  composition: 'centered' | 'rule-of-thirds' | 'golden-ratio' | 'dynamic';
  overlay?: TitleConfig;
}

// Product Photo specific
export interface ProductPhotoConfig {
  product: {
    description: string;
    angle: 'front' | 'side' | 'top' | 'three-quarter' | 'hero';
    position: 'center' | 'left' | 'right';
  };
  background: BackgroundConfig;
  lighting: 'studio' | 'natural' | 'dramatic' | 'soft' | 'rim' | 'three-point';
  shadows: 'hard' | 'soft' | 'none' | 'drop-shadow';
  reflections?: boolean;
  props?: string[]; // Additional props/context items
  style: 'minimal' | 'lifestyle' | 'editorial' | 'e-commerce' | 'luxury';
  effects: EffectsConfig;
}

// Generic/Custom config (flexible structure)
export interface CustomPresetConfig {
  components: Record<string, any>;
  freeformPrompt?: string;
}

// Union type for all config types
export type PresetConfig = 
  | YouTubeThumbnailConfig
  | InstagramPostConfig
  | ProductPhotoConfig
  | CustomPresetConfig;

// ===== MAIN PRESET TYPE =====

export interface UserPreset {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: PresetCategory;
  is_favorite: boolean;
  
  // Image specifications
  aspect_ratio: AspectRatioExtended;
  width: number;
  height: number;
  
  // Configuration (JSONB in database)
  config: PresetConfig;
  
  // Generated prompt
  generated_prompt?: string;
  
  // Metadata
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserPresetInsert {
  user_id: string;
  name: string;
  description?: string;
  category: PresetCategory;
  is_favorite?: boolean;
  aspect_ratio: AspectRatioExtended;
  width: number;
  height: number;
  config: PresetConfig;
  generated_prompt?: string;
}

export interface UserPresetUpdate {
  name?: string;
  description?: string;
  category?: PresetCategory;
  is_favorite?: boolean;
  aspect_ratio?: AspectRatioExtended;
  width?: number;
  height?: number;
  config?: PresetConfig;
  generated_prompt?: string;
}

// ===== TEMPLATE TYPES =====

// Preset template for creating new presets from predefined templates
export interface PresetTemplate {
  category: PresetCategory;
  name: string;
  description: string;
  defaultConfig: Partial<PresetConfig>;
  defaultDimensions: {
    aspect_ratio: AspectRatioExtended;
    width: number;
    height: number;
  };
  icon?: string;
  examples?: string[];
}
