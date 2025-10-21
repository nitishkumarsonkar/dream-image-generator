// Preset Prompt Builder
// Converts structured preset configurations into detailed, optimized prompts

import {
  PresetConfig,
  YouTubeThumbnailConfig,
  InstagramPostConfig,
  ProductPhotoConfig,
  CustomPresetConfig,
  SubjectConfig,
  TitleConfig,
  BackgroundConfig,
  EffectsConfig,
  PresetCategory,
} from '../types/presets';

/**
 * Main function to build a prompt from preset configuration
 */
export function buildPromptFromPreset(
  config: PresetConfig,
  category: PresetCategory,
  userInput?: string
): string {
  switch (category) {
    case 'youtube_thumbnail':
      return buildYouTubeThumbnailPrompt(config as YouTubeThumbnailConfig, userInput);
    case 'instagram_post':
      return buildInstagramPostPrompt(config as InstagramPostConfig, userInput);
    case 'product_photo':
      return buildProductPhotoPrompt(config as ProductPhotoConfig, userInput);
    case 'custom':
      return buildCustomPrompt(config as CustomPresetConfig, userInput);
    default:
      return buildGenericPrompt(config, userInput);
  }
}

/**
 * Build YouTube Thumbnail prompt
 */
function buildYouTubeThumbnailPrompt(
  config: YouTubeThumbnailConfig,
  userInput?: string
): string {
  const parts: string[] = [];

  // Start with core concept
  if (userInput) {
    parts.push(`YouTube thumbnail for: ${userInput}.`);
  } else {
    parts.push('Create a compelling YouTube thumbnail.');
  }

  // Subject
  if (config.subject && config.subject.type !== 'none') {
    const subjectPart = buildSubjectDescription(config.subject);
    parts.push(subjectPart);
  }

  // Title/Text
  if (config.title?.enabled) {
    const titlePart = buildTitleDescription(config.title);
    parts.push(titlePart);
  }

  // Background
  if (config.background) {
    const bgPart = buildBackgroundDescription(config.background);
    parts.push(bgPart);
  }

  // Style and mood
  parts.push(`${config.style} style, ${config.mood} mood.`);

  // Lighting
  parts.push(`${config.lighting} lighting.`);

  // Effects
  if (config.effects) {
    const effectsPart = buildEffectsDescription(config.effects);
    if (effectsPart) parts.push(effectsPart);
  }

  // Additional elements
  if (config.additionalElements && config.additionalElements.length > 0) {
    const elements = config.additionalElements
      .map(el => `${el.size || 'medium'} ${el.type}: ${el.description} at ${el.position}`)
      .join(', ');
    parts.push(`Additional elements: ${elements}.`);
  }

  // Clickbait emphasis
  if (config.clickbait) {
    parts.push('High energy, attention-grabbing composition, designed to maximize clicks.');
  }

  // Technical specs
  parts.push('High resolution, sharp details, vibrant colors, optimized for YouTube thumbnail display (1920x1080).');

  return parts.join(' ');
}

/**
 * Build Instagram Post prompt
 */
function buildInstagramPostPrompt(
  config: InstagramPostConfig,
  userInput?: string
): string {
  const parts: string[] = [];

  if (userInput) {
    parts.push(`Instagram post featuring: ${userInput}.`);
  } else {
    parts.push('Create an Instagram-worthy image.');
  }

  // Subject
  if (config.subject && config.subject.type !== 'none') {
    const subjectPart = buildSubjectDescription(config.subject);
    parts.push(subjectPart);
  }

  // Background
  if (config.background) {
    const bgPart = buildBackgroundDescription(config.background);
    parts.push(bgPart);
  }

  // Style and composition
  parts.push(`${config.style} Instagram aesthetic, ${config.composition} composition.`);
  parts.push(`${config.mood} mood.`);

  // Filter
  if (config.filter && config.filter !== 'none') {
    parts.push(`${config.filter} color grading.`);
  }

  // Effects
  if (config.effects) {
    const effectsPart = buildEffectsDescription(config.effects);
    if (effectsPart) parts.push(effectsPart);
  }

  // Overlay text
  if (config.overlay?.enabled) {
    const overlayPart = buildTitleDescription(config.overlay);
    parts.push(overlayPart);
  }

  // Technical specs
  parts.push('High quality, Instagram-optimized, perfect for social media engagement.');

  return parts.join(' ');
}

/**
 * Build Product Photo prompt
 */
function buildProductPhotoPrompt(
  config: ProductPhotoConfig,
  userInput?: string
): string {
  const parts: string[] = [];

  if (userInput) {
    parts.push(`Professional product photography of: ${userInput}.`);
  } else if (config.product.description) {
    parts.push(`Professional product photography of ${config.product.description}.`);
  } else {
    parts.push('Professional product photography.');
  }

  // Product details
  parts.push(`${config.product.angle} angle view, positioned ${config.product.position}.`);

  // Background
  if (config.background) {
    const bgPart = buildBackgroundDescription(config.background);
    parts.push(bgPart);
  }

  // Lighting
  parts.push(`${config.lighting} lighting.`);

  // Shadows
  if (config.shadows !== 'none') {
    parts.push(`${config.shadows} shadows.`);
  }

  // Reflections
  if (config.reflections) {
    parts.push('Subtle reflections on surface.');
  }

  // Props
  if (config.props && config.props.length > 0) {
    parts.push(`Styled with: ${config.props.join(', ')}.`);
  }

  // Style
  parts.push(`${config.style} product photography style.`);

  // Effects
  if (config.effects) {
    const effectsPart = buildEffectsDescription(config.effects);
    if (effectsPart) parts.push(effectsPart);
  }

  // Technical specs
  parts.push('Ultra-sharp focus, professional color accuracy, high-end commercial quality, 4K detail.');

  return parts.join(' ');
}

/**
 * Build custom/generic prompt
 */
function buildCustomPrompt(config: CustomPresetConfig, userInput?: string): string {
  const parts: string[] = [];

  if (userInput) {
    parts.push(userInput);
  }

  if (config.freeformPrompt) {
    parts.push(config.freeformPrompt);
  }

  // Process any structured components
  if (config.components) {
    Object.entries(config.components).forEach(([key, value]) => {
      if (typeof value === 'string') {
        parts.push(`${key}: ${value}`);
      } else if (typeof value === 'object' && value !== null) {
        parts.push(`${key}: ${JSON.stringify(value)}`);
      }
    });
  }

  return parts.join(' ') || 'Create a high-quality image.';
}

/**
 * Build generic prompt for unknown categories
 */
function buildGenericPrompt(config: any, userInput?: string): string {
  const parts: string[] = [];

  if (userInput) {
    parts.push(userInput);
  }

  // Try to extract common fields
  if (config.subject) {
    parts.push(buildSubjectDescription(config.subject));
  }

  if (config.background) {
    parts.push(buildBackgroundDescription(config.background));
  }

  if (config.style) {
    parts.push(`${config.style} style.`);
  }

  if (config.mood) {
    parts.push(`${config.mood} mood.`);
  }

  if (config.effects) {
    const effectsPart = buildEffectsDescription(config.effects);
    if (effectsPart) parts.push(effectsPart);
  }

  return parts.join(' ') || 'Create a high-quality image.';
}

/**
 * Helper: Build subject description
 */
function buildSubjectDescription(subject: SubjectConfig): string {
  const parts: string[] = [];

  // Type and description
  if (subject.description) {
    parts.push(`${subject.type}: ${subject.description}`);
  } else {
    parts.push(subject.type);
  }

  // Expression
  if (subject.expression) {
    const expr = subject.expression === 'custom' && subject.customExpression
      ? subject.customExpression
      : subject.expression;
    parts.push(`with ${expr} expression`);
  }

  // Position and size
  parts.push(`positioned ${subject.position}, ${subject.size} size`);

  // Angle
  if (subject.angle) {
    parts.push(`${subject.angle} angle`);
  }

  // Additional details
  if (subject.detail) {
    parts.push(subject.detail);
  }

  return parts.join(', ') + '.';
}

/**
 * Helper: Build title/text description
 */
function buildTitleDescription(title: TitleConfig): string {
  const parts: string[] = [];

  if (title.text) {
    parts.push(`Text overlay: "${title.text}"`);
  } else {
    parts.push('Text overlay');
  }

  // Style
  const style = title.style === 'custom' && title.customStyle
    ? title.customStyle
    : title.style;
  parts.push(`${style} typography`);

  // Color
  const color = title.color === 'custom' && title.customColor
    ? title.customColor
    : title.color;
  parts.push(`${color} color`);

  // Position and alignment
  parts.push(`positioned ${title.position}, ${title.alignment} aligned`);

  // Font size
  parts.push(`${title.fontSize} font`);

  // Effect
  if (title.effect && title.effect !== 'none') {
    parts.push(`with ${title.effect} effect`);
  }

  // Font family
  if (title.font) {
    parts.push(`using ${title.font} font`);
  }

  return parts.join(', ') + '.';
}

/**
 * Helper: Build background description
 */
function buildBackgroundDescription(background: BackgroundConfig): string {
  const parts: string[] = [];

  parts.push(`${background.type} background`);

  if (background.style) {
    parts.push(background.style);
  }

  if (background.colors && background.colors.length > 0) {
    parts.push(`colors: ${background.colors.join(', ')}`);
  }

  if (background.texture) {
    parts.push(`${background.texture} texture`);
  }

  if (background.description) {
    parts.push(background.description);
  }

  return parts.join(', ') + '.';
}

/**
 * Helper: Build effects description
 */
function buildEffectsDescription(effects: EffectsConfig): string {
  const parts: string[] = [];

  if (effects.blur && effects.blur !== 'none') {
    parts.push(`${effects.blur} blur`);
  }

  if (effects.glow && effects.glow !== 'none') {
    parts.push(`${effects.glow} glow`);
  }

  if (effects.vignette) {
    parts.push('subtle vignette');
  }

  if (effects.grain) {
    parts.push('film grain texture');
  }

  if (effects.colorGrading) {
    parts.push(`${effects.colorGrading} color grading`);
  }

  if (effects.contrast && effects.contrast !== 'normal') {
    parts.push(`${effects.contrast} contrast`);
  }

  if (effects.saturation && effects.saturation !== 'normal') {
    parts.push(`${effects.saturation} saturation`);
  }

  return parts.length > 0 ? `Effects: ${parts.join(', ')}.` : '';
}

/**
 * Extract user input placeholder from config
 * This helps identify what the user needs to provide when using a preset
 */
export function getPresetInputPlaceholder(category: PresetCategory): string {
  switch (category) {
    case 'youtube_thumbnail':
      return 'Enter your video topic or main message...';
    case 'instagram_post':
      return 'Describe the main subject or theme...';
    case 'product_photo':
      return 'Describe your product...';
    default:
      return 'Enter your core idea...';
  }
}

/**
 * Validate preset configuration
 */
export function validatePresetConfig(config: PresetConfig, category: PresetCategory): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Category-specific validation
  switch (category) {
    case 'youtube_thumbnail':
      const ytConfig = config as YouTubeThumbnailConfig;
      if (!ytConfig.subject) errors.push('Subject configuration is required');
      if (!ytConfig.background) errors.push('Background configuration is required');
      if (!ytConfig.style) errors.push('Style is required');
      if (!ytConfig.mood) errors.push('Mood is required');
      if (!ytConfig.lighting) errors.push('Lighting is required');
      break;

    case 'instagram_post':
      const igConfig = config as InstagramPostConfig;
      if (!igConfig.background) errors.push('Background configuration is required');
      if (!igConfig.style) errors.push('Style is required');
      if (!igConfig.composition) errors.push('Composition is required');
      break;

    case 'product_photo':
      const prodConfig = config as ProductPhotoConfig;
      if (!prodConfig.product) errors.push('Product configuration is required');
      if (!prodConfig.background) errors.push('Background configuration is required');
      if (!prodConfig.lighting) errors.push('Lighting is required');
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
