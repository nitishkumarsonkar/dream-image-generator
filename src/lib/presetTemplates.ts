// Preset Templates
// Pre-configured templates for common use cases

import {
  PresetTemplate,
  YouTubeThumbnailConfig,
  InstagramPostConfig,
  ProductPhotoConfig,
} from '../types/presets';

export const PRESET_TEMPLATES: Record<string, PresetTemplate> = {
  // ===== YOUTUBE THUMBNAILS =====
  youtube_gaming: {
    category: 'youtube_thumbnail',
    name: 'Gaming Thumbnail',
    description: 'High-energy gaming video thumbnail with bold text and vibrant colors',
    defaultConfig: {
      subject: {
        type: 'character',
        description: 'Gaming character or gameplay scene',
        expression: 'excited',
        position: 'center',
        size: 'large',
        angle: 'three-quarter',
      },
      title: {
        enabled: true,
        text: 'YOUR TITLE HERE',
        style: 'bold',
        color: 'yellow',
        position: 'bottom',
        alignment: 'center',
        fontSize: 'large',
        effect: 'outline',
      },
      background: {
        type: 'gradient',
        style: 'gaming',
        colors: ['#FF00FF', '#00FFFF', '#FF0080'],
        description: 'Dynamic, energetic gradient with tech elements',
      },
      effects: {
        blur: 'none',
        glow: 'strong',
        vignette: true,
        grain: false,
        colorGrading: 'cinematic',
        contrast: 'high',
        saturation: 'vibrant',
      },
      mood: 'energetic',
      style: '3d',
      lighting: 'dramatic',
      clickbait: true,
    } as YouTubeThumbnailConfig,
    defaultDimensions: {
      aspect_ratio: '16:9',
      width: 1920,
      height: 1080,
    },
    icon: '🎮',
    examples: ['FORTNITE WIN!', 'NEW UPDATE IS INSANE!', 'YOU WON\'T BELIEVE THIS...'],
  },

  youtube_tutorial: {
    category: 'youtube_thumbnail',
    name: 'Tutorial Thumbnail',
    description: 'Clean, professional tutorial thumbnail with clear subject and text',
    defaultConfig: {
      subject: {
        type: 'person',
        description: 'Instructor or demonstration',
        expression: 'happy',
        position: 'left',
        size: 'medium',
        angle: 'front',
      },
      title: {
        enabled: true,
        text: 'HOW TO...',
        style: 'modern',
        color: 'white',
        position: 'top-right',
        alignment: 'left',
        fontSize: 'large',
        effect: 'shadow',
      },
      background: {
        type: 'gradient',
        style: 'professional',
        colors: ['#667EEA', '#764BA2'],
        description: 'Clean, professional gradient',
      },
      effects: {
        blur: 'subtle',
        glow: 'none',
        vignette: false,
        grain: false,
        colorGrading: 'neutral',
        contrast: 'normal',
        saturation: 'normal',
      },
      mood: 'professional',
      style: 'photographic',
      lighting: 'soft',
      clickbait: false,
    } as YouTubeThumbnailConfig,
    defaultDimensions: {
      aspect_ratio: '16:9',
      width: 1920,
      height: 1080,
    },
    icon: '📚',
    examples: ['How to Code in Python', 'Complete Photoshop Tutorial', 'Learn This Skill Fast'],
  },

  youtube_vlog: {
    category: 'youtube_thumbnail',
    name: 'Vlog Thumbnail',
    description: 'Lifestyle vlog thumbnail with natural aesthetic',
    defaultConfig: {
      subject: {
        type: 'person',
        description: 'Vlogger with expressive pose',
        expression: 'happy',
        position: 'center',
        size: 'large',
        angle: 'three-quarter',
      },
      title: {
        enabled: true,
        text: 'VLOG TITLE',
        style: 'modern',
        color: 'white',
        position: 'bottom',
        alignment: 'center',
        fontSize: 'medium',
        effect: 'shadow',
      },
      background: {
        type: 'blur',
        style: 'light',
        description: 'Blurred lifestyle background scene',
      },
      effects: {
        blur: 'subtle',
        glow: 'none',
        vignette: true,
        grain: true,
        colorGrading: 'warm',
        contrast: 'normal',
        saturation: 'high',
      },
      mood: 'playful',
      style: 'realistic',
      lighting: 'natural',
      clickbait: false,
    } as YouTubeThumbnailConfig,
    defaultDimensions: {
      aspect_ratio: '16:9',
      width: 1920,
      height: 1080,
    },
    icon: '📹',
    examples: ['Day in My Life', 'We Tried This...', 'Surprise Adventure!'],
  },

  // ===== INSTAGRAM POSTS =====
  instagram_minimal: {
    category: 'instagram_post',
    name: 'Minimal Instagram',
    description: 'Clean, minimal aesthetic perfect for lifestyle and aesthetic posts',
    defaultConfig: {
      subject: {
        type: 'object',
        description: 'Main subject centered',
        position: 'center',
        size: 'medium',
      },
      background: {
        type: 'solid',
        style: 'minimal',
        colors: ['#F5F5F5'],
        texture: 'smooth',
      },
      effects: {
        blur: 'none',
        glow: 'none',
        vignette: false,
        grain: false,
        colorGrading: 'neutral',
        contrast: 'low',
        saturation: 'low',
      },
      style: 'minimal',
      mood: 'calm',
      filter: 'muted',
      composition: 'centered',
    } as InstagramPostConfig,
    defaultDimensions: {
      aspect_ratio: '1:1',
      width: 1080,
      height: 1080,
    },
    icon: '✨',
    examples: ['Morning Coffee', 'Minimalist Workspace', 'Simple Beauty'],
  },

  instagram_vibrant: {
    category: 'instagram_post',
    name: 'Vibrant Instagram',
    description: 'Bold, colorful posts that pop on the feed',
    defaultConfig: {
      subject: {
        type: 'object',
        description: 'Colorful subject',
        position: 'center',
        size: 'large',
      },
      background: {
        type: 'gradient',
        style: 'vibrant',
        colors: ['#FF6B6B', '#FFD93D', '#6BCF7F'],
        texture: 'smooth',
      },
      effects: {
        blur: 'none',
        glow: 'soft',
        vignette: false,
        grain: false,
        colorGrading: 'warm',
        contrast: 'high',
        saturation: 'vibrant',
      },
      style: 'vibrant',
      mood: 'energetic',
      filter: 'bright',
      composition: 'dynamic',
    } as InstagramPostConfig,
    defaultDimensions: {
      aspect_ratio: '4:5',
      width: 1080,
      height: 1350,
    },
    icon: '🌈',
    examples: ['Summer Vibes', 'Colorful Food', 'Bold Fashion'],
  },

  instagram_story: {
    category: 'instagram_post',
    name: 'Instagram Story',
    description: 'Vertical story format with engaging design',
    defaultConfig: {
      subject: {
        type: 'person',
        description: 'Story content',
        position: 'center',
        size: 'large',
      },
      background: {
        type: 'gradient',
        style: 'vibrant',
        colors: ['#667EEA', '#F093FB'],
      },
      effects: {
        blur: 'none',
        glow: 'soft',
        vignette: true,
        grain: true,
        colorGrading: 'warm',
        contrast: 'normal',
        saturation: 'high',
      },
      style: 'lifestyle',
      mood: 'fun',
      filter: 'warm',
      composition: 'rule-of-thirds',
      overlay: {
        enabled: true,
        text: 'Swipe Up!',
        style: 'modern',
        color: 'white',
        position: 'bottom',
        alignment: 'center',
        fontSize: 'medium',
        effect: 'shadow',
      },
    } as InstagramPostConfig,
    defaultDimensions: {
      aspect_ratio: '9:16',
      width: 1080,
      height: 1920,
    },
    icon: '📱',
    examples: ['Behind the Scenes', 'Quick Tip', 'Ask Me Anything'],
  },

  // ===== PRODUCT PHOTOS =====
  product_ecommerce: {
    category: 'product_photo',
    name: 'E-commerce Product',
    description: 'Clean product shot perfect for online stores',
    defaultConfig: {
      product: {
        description: 'Product name/description',
        angle: 'three-quarter',
        position: 'center',
      },
      background: {
        type: 'solid',
        style: 'minimal',
        colors: ['#FFFFFF'],
        texture: 'smooth',
      },
      lighting: 'studio',
      shadows: 'soft',
      reflections: false,
      props: [],
      style: 'e-commerce',
      effects: {
        blur: 'none',
        glow: 'none',
        vignette: false,
        grain: false,
        colorGrading: 'neutral',
        contrast: 'normal',
        saturation: 'normal',
      },
    } as ProductPhotoConfig,
    defaultDimensions: {
      aspect_ratio: '1:1',
      width: 2000,
      height: 2000,
    },
    icon: '🛍️',
    examples: ['Smartwatch', 'Sneakers', 'Laptop'],
  },

  product_lifestyle: {
    category: 'product_photo',
    name: 'Lifestyle Product',
    description: 'Product in real-life context with props and styling',
    defaultConfig: {
      product: {
        description: 'Product in lifestyle setting',
        angle: 'three-quarter',
        position: 'center',
      },
      background: {
        type: 'image',
        style: 'light',
        description: 'Lifestyle scene or setting',
        texture: 'smooth',
      },
      lighting: 'natural',
      shadows: 'soft',
      reflections: true,
      props: ['Context items', 'Styling elements'],
      style: 'lifestyle',
      effects: {
        blur: 'subtle',
        glow: 'none',
        vignette: true,
        grain: true,
        colorGrading: 'warm',
        contrast: 'normal',
        saturation: 'high',
      },
    } as ProductPhotoConfig,
    defaultDimensions: {
      aspect_ratio: '4:5',
      width: 1080,
      height: 1350,
    },
    icon: '☕',
    examples: ['Coffee Mug on Desk', 'Skincare on Marble', 'Tech in Workspace'],
  },

  product_luxury: {
    category: 'product_photo',
    name: 'Luxury Product',
    description: 'High-end, premium product photography',
    defaultConfig: {
      product: {
        description: 'Luxury product',
        angle: 'hero',
        position: 'center',
      },
      background: {
        type: 'gradient',
        style: 'professional',
        colors: ['#1A1A1A', '#2D2D2D'],
        texture: 'glossy',
      },
      lighting: 'dramatic',
      shadows: 'hard',
      reflections: true,
      props: ['Luxury elements', 'Premium materials'],
      style: 'luxury',
      effects: {
        blur: 'none',
        glow: 'soft',
        vignette: true,
        grain: false,
        colorGrading: 'cinematic',
        contrast: 'high',
        saturation: 'normal',
      },
    } as ProductPhotoConfig,
    defaultDimensions: {
      aspect_ratio: '3:2',
      width: 3000,
      height: 2000,
    },
    icon: '💎',
    examples: ['Designer Watch', 'Perfume Bottle', 'Luxury Jewelry'],
  },
};

// Get templates by category
export function getTemplatesByCategory(category: string): PresetTemplate[] {
  return Object.values(PRESET_TEMPLATES).filter(t => t.category === category);
}

// Get all categories with templates
export function getAvailableCategories(): Array<{ id: string; name: string; icon: string; count: number }> {
  const categories = new Map<string, { name: string; icon: string; count: number }>();
  
  Object.values(PRESET_TEMPLATES).forEach(template => {
    const current = categories.get(template.category) || { name: '', icon: '', count: 0 };
    categories.set(template.category, {
      name: formatCategoryName(template.category),
      icon: template.icon || '📸',
      count: current.count + 1,
    });
  });

  return Array.from(categories.entries()).map(([id, data]) => ({ id, ...data }));
}

function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
