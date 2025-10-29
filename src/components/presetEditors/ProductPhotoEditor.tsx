/**
 * Product Photo Preset Editor
 */

'use client';

import React from 'react';
import { ProductPhotoConfig } from '@/types/presets';

interface ProductPhotoEditorProps {
  config: ProductPhotoConfig;
  onChange: (config: ProductPhotoConfig) => void;
}

export default function ProductPhotoEditor({
  config,
  onChange,
}: ProductPhotoEditorProps) {
  const updateConfig = (updates: Partial<ProductPhotoConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateProduct = (updates: Partial<ProductPhotoConfig['product']>) => {
    onChange({ ...config, product: { ...config.product, ...updates } });
  };

  const updateBackground = (updates: Partial<ProductPhotoConfig['background']>) => {
    onChange({ ...config, background: { ...config.background, ...updates } });
  };

  const updateEffects = (updates: Partial<ProductPhotoConfig['effects']>) => {
    onChange({ ...config, effects: { ...config.effects, ...updates } });
  };

  return (
    <div className="space-y-6">
      <Section title="Product" icon="📦">
        <TextArea
          label="Product Description"
          value={config.product.description}
          onChange={(value) => updateProduct({ description: value })}
          placeholder="Describe your product in detail..."
          rows={2}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Angle"
            value={config.product.angle}
            onChange={(value) => updateProduct({ angle: value as any })}
            options={[
              { value: 'front', label: 'Front' },
              { value: 'side', label: 'Side' },
              { value: 'top', label: 'Top' },
              { value: 'three-quarter', label: 'Three-Quarter' },
              { value: 'hero', label: 'Hero Shot' },
            ]}
          />
          <Select
            label="Position"
            value={config.product.position}
            onChange={(value) => updateProduct({ position: value as any })}
            options={[
              { value: 'center', label: 'Center' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </div>
      </Section>

      <Section title="Background" icon="🎨">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            value={config.background.type}
            onChange={(value) => updateBackground({ type: value as any })}
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'gradient', label: 'Gradient' },
              { value: 'pattern', label: 'Pattern' },
              { value: 'image', label: 'Image/Scene' },
            ]}
          />
          <Select
            label="Style"
            value={config.background.style || 'minimal'}
            onChange={(value) => updateBackground({ style: value as any })}
            options={[
              { value: 'minimal', label: 'Minimal' },
              { value: 'professional', label: 'Professional' },
              { value: 'vibrant', label: 'Vibrant' },
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </div>
        <TextArea
          label="Background Details (optional)"
          value={config.background.description || ''}
          onChange={(value) => updateBackground({ description: value })}
          placeholder="Additional background context..."
          rows={2}
        />
      </Section>

      <Section title="Lighting & Style" icon="💡">
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Lighting"
            value={config.lighting}
            onChange={(value) => updateConfig({ lighting: value as any })}
            options={[
              { value: 'studio', label: 'Studio' },
              { value: 'natural', label: 'Natural' },
              { value: 'dramatic', label: 'Dramatic' },
              { value: 'soft', label: 'Soft' },
              { value: 'rim', label: 'Rim Light' },
              { value: 'three-point', label: 'Three-Point' },
            ]}
          />
          <Select
            label="Shadows"
            value={config.shadows}
            onChange={(value) => updateConfig({ shadows: value as any })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'soft', label: 'Soft' },
              { value: 'hard', label: 'Hard' },
              { value: 'drop-shadow', label: 'Drop Shadow' },
            ]}
          />
          <Select
            label="Style"
            value={config.style}
            onChange={(value) => updateConfig({ style: value as any })}
            options={[
              { value: 'e-commerce', label: 'E-commerce' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'lifestyle', label: 'Lifestyle' },
              { value: 'editorial', label: 'Editorial' },
              { value: 'luxury', label: 'Luxury' },
            ]}
          />
        </div>
        
        <Checkbox
          label="Include Reflections"
          checked={config.reflections || false}
          onChange={(checked) => updateConfig({ reflections: checked })}
        />
      </Section>

      <Section title="Props & Context" icon="🎬">
        <TextArea
          label="Additional Props (comma-separated)"
          value={config.props?.join(', ') || ''}
          onChange={(value) => updateConfig({ 
            props: value.split(',').map(p => p.trim()).filter(Boolean) 
          })}
          placeholder="e.g., coffee cup, plant, books..."
          rows={2}
        />
      </Section>

      <Section title="Effects" icon="✨">
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Color Grading"
            value={config.effects.colorGrading || 'neutral'}
            onChange={(value) => updateEffects({ colorGrading: value as any })}
            options={[
              { value: 'neutral', label: 'Neutral' },
              { value: 'warm', label: 'Warm' },
              { value: 'cool', label: 'Cool' },
              { value: 'vintage', label: 'Vintage' },
              { value: 'cinematic', label: 'Cinematic' },
            ]}
          />
          <Select
            label="Contrast"
            value={config.effects.contrast || 'normal'}
            onChange={(value) => updateEffects({ contrast: value as any })}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
            ]}
          />
          <Select
            label="Saturation"
            value={config.effects.saturation || 'normal'}
            onChange={(value) => updateEffects({ saturation: value as any })}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
              { value: 'vibrant', label: 'Vibrant' },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}

// UI Components
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 space-y-4">
      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows || 3}
        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
      />
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
    </label>
  );
}
