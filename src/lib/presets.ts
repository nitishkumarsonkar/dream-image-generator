// Centralized, typed preset registry for platform-aware image generation.
// This avoids scattering preset strings across components and enables
// consistent UI (ratio pill, resolution) and prompt templating.

export type PresetKey = "instagram" | "ghibli" | "professional" | "other";

// Keep ratios constrained for predictable exports and UI badges.
// If you add more, prefer well-known platform aspect ratios.
export type AspectRatio = "1:1" | "4:5" | "16:9";

export type Preset = {
  id: PresetKey;
  label: string;
  desc?: string;

  // Display ratio + concrete export size to guide generation/export.
  ratio: AspectRatio;
  width: number;
  height: number;

  // Prompt scaffolding to append to user's prompt (except "other").
  // Use {topic} or leave generic if not topic-based.
  promptTemplate: string;

  // Optional platform for future platform-specific helpers (safe areas, etc.)
  platform?: "instagram" | "linkedin" | "youtube";

  // Optional flags for lightweight post-processing (future)
  watermark?: boolean;
  overlayText?: { placeholder: string; maxChars: number };
};

// NOTE: Sizes chosen to match common platform specs where applicable.
// - Instagram portrait: 1080x1350 (4:5)
// - Linked "professional" here defaults to square export for versatility.
// - Ghibli is a style-focused preset; use 16:9 for cinematic feel.
export const PRESETS: Record<PresetKey, Preset> = {
  instagram: {
    id: "instagram",
    label: "Instagram-ready image",
    desc: "1080×1350, vibrant, crisp",
    ratio: "4:5",
    width: 1080,
    height: 1350,
    promptTemplate:
      "Create an Instagram-ready vertical image (1080x1350). High contrast, vibrant colors, crisp details, minimal background, subtle grain. Export as PNG.",
    platform: "instagram",
    watermark: false,
    overlayText: { placeholder: "Add a catchy headline", maxChars: 80 },
  },
  ghibli: {
    id: "ghibli",
    label: "Ghibli image",
    desc: "Soft pastels, painterly, whimsical",
    ratio: "16:9",
    width: 1280,
    height: 720,
    promptTemplate:
      "Render in a Studio Ghibli-inspired style: soft pastels, painterly textures, warm sunlight, whimsical mood, gentle outlines, detailed nature background.",
    watermark: false,
  },
  professional: {
    id: "professional",
    label: "Professional image",
    desc: "Studio-quality, neutral bg",
    ratio: "1:1",
    width: 1200,
    height: 1200,
    promptTemplate:
      "Create a professional studio-quality product photo. Neutral background, soft diffused lighting, high dynamic range, sharp focus, realistic color, 4k detail.",
  },
  // "Other" is special: we don't enforce a template; user provides custom snippet.
  // We still provide a default ratio/size for the UI badge to avoid undefined states.
  other: {
    id: "other",
    label: "Other (custom)",
    desc: "Append your own snippet",
    ratio: "1:1",
    width: 1024,
    height: 1024,
    promptTemplate: "",
  },
};

// Helper for UI badges and tooltips.
export function formatResolution(preset: Pick<Preset, "width" | "height">): string {
  return `${preset.width}×${preset.height}`;
}
