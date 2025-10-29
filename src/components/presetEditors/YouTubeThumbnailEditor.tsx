/**
 * YouTube Thumbnail Preset Editor
 * Comprehensive editor for YouTube thumbnail presets with detailed configuration options
 */

'use client';

import React from 'react';
import { YouTubeThumbnailConfig } from '@/types/presets';

interface YouTubeThumbnailEditorProps {
  config: YouTubeThumbnailConfig;
  onChange: (config: YouTubeThumbnailConfig) => void;
}

export default function YouTubeThumbnailEditor({
  config,
  onChange,
}: YouTubeThumbnailEditorProps) {
  const updateConfig = (updates: Partial<YouTubeThumbnailConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateSubject = (updates: Partial<YouTubeThumbnailConfig['subject']>) => {
    onChange({ ...config, subject: { ...config.subject, ...updates } });
  };

  const updateTitle = (updates: Partial<YouTubeThumbnailConfig['title']>) => {
    onChange({ ...config, title: { ...config.title, ...updates } });
  };

  const updateBackground = (updates: Partial<YouTubeThumbnailConfig['background']>) => {
    onChange({ ...config, background: { ...config.background, ...updates } });
  };

  const updateEffects = (updates: Partial<YouTubeThumbnailConfig['effects']>) => {
    onChange({ ...config, effects: { ...config.effects, ...updates } });
  };

  return (
    <div className="space-y-6">
      {/* Subject Configuration */}
      <Section title="Subject" icon="👤">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Type"
            value={config.subject.type}
            onChange={(value) => updateSubject({ type: value as any })}
            options={[
              { value: 'person', label: 'Person' },
              { value: 'object', label: 'Object' },
              { value: 'character', label: 'Character' },
              { value: 'animal', label: 'Animal' },
              { value: 'none', label: 'None' },
            ]}
          />
          
          <Select
            label="Size"
            value={config.subject.size}
            onChange={(value) => updateSubject({ size: value as any })}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
          />
          
          <Select
            label="Position"
            value={config.subject.position}
            onChange={(value) => updateSubject({ position: value as any })}
            options={[
              { value: 'center', label: 'Center' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' },
            ]}
          />
          
          <Select
            label="Expression"
            value={config.subject.expression || 'neutral'}
            onChange={(value) => updateSubject({ expression: value as any })}
            options={[
              { value: 'excited', label: 'Excited' },
              { value: 'serious', label: 'Serious' },
              { value: 'happy', label: 'Happy' },
              { value: 'angry', label: 'Angry' },
              { value: 'surprised', label: 'Surprised' },
              { value: 'neutral', label: 'Neutral' },
              { value: 'custom', label: 'Custom' },
            ]}
          />
        </div>
        
        <TextArea
          label="Description"
          value={config.subject.description}
          onChange={(value) => updateSubject({ description: value })}
          placeholder="Describe the subject in detail..."
          rows={2}
        />
        
        {config.subject.expression === 'custom' && (
          <Input
            label="Custom Expression"
            value={config.subject.customExpression || ''}
            onChange={(value) => updateSubject({ customExpression: value })}
            placeholder="e.g., determined, curious..."
          />
        )}
      </Section>

      {/* Title Configuration */}
      <Section title="Title/Text" icon="📝">
        <Checkbox
          label="Enable Title"
          checked={config.title.enabled}
          onChange={(checked) => updateTitle({ enabled: checked })}
        />
        
        {config.title.enabled && (
          <div className="space-y-4 mt-4">
            <Input
              label="Title Text (optional)"
              value={config.title.text || ''}
              onChange={(value) => updateTitle({ text: value })}
              placeholder="YOUR TITLE HERE"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Style"
                value={config.title.style}
                onChange={(value) => updateTitle({ style: value as any })}
                options={[
                  { value: 'bold', label: 'Bold' },
                  { value: 'modern', label: 'Modern' },
                  { value: 'retro', label: 'Retro' },
                  { value: 'minimal', label: 'Minimal' },
                  { value: 'gaming', label: 'Gaming' },
                  { value: 'elegant', label: 'Elegant' },
                ]}
              />
              
              <Select
                label="Color"
                value={config.title.color}
                onChange={(value) => updateTitle({ color: value as any })}
                options={[
                  { value: 'white', label: 'White' },
                  { value: 'black', label: 'Black' },
                  { value: 'red', label: 'Red' },
                  { value: 'yellow', label: 'Yellow' },
                  { value: 'blue', label: 'Blue' },
                  { value: 'gradient', label: 'Gradient' },
                  { value: 'custom', label: 'Custom' },
                ]}
              />
              
              <Select
                label="Font Size"
                value={config.title.fontSize}
                onChange={(value) => updateTitle({ fontSize: value as any })}
                options={[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' },
                ]}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Position"
                value={config.title.position}
                onChange={(value) => updateTitle({ position: value as any })}
                options={[
                  { value: 'top', label: 'Top' },
                  { value: 'center', label: 'Center' },
                  { value: 'bottom', label: 'Bottom' },
                  { value: 'top-left', label: 'Top Left' },
                  { value: 'top-right', label: 'Top Right' },
                  { value: 'bottom-left', label: 'Bottom Left' },
                  { value: 'bottom-right', label: 'Bottom Right' },
                ]}
              />
              
              <Select
                label="Alignment"
                value={config.title.alignment}
                onChange={(value) => updateTitle({ alignment: value as any })}
                options={[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' },
                ]}
              />
              
              <Select
                label="Effect"
                value={config.title.effect || 'none'}
                onChange={(value) => updateTitle({ effect: value as any })}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'shadow', label: 'Shadow' },
                  { value: 'outline', label: 'Outline' },
                  { value: 'glow', label: 'Glow' },
                ]}
              />
            </div>
          </div>
        )}
      </Section>

      {/* Background Configuration */}
      <Section title="Background" icon="🎨">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Type"
            value={config.background.type}
            onChange={(value) => updateBackground({ type: value as any })}
            options={[
              { value: 'gradient', label: 'Gradient' },
              { value: 'solid', label: 'Solid' },
              { value: 'pattern', label: 'Pattern' },
              { value: 'image', label: 'Image' },
              { value: 'blur', label: 'Blur' },
            ]}
          />
          
          <Select
            label="Style"
            value={config.background.style || 'vibrant'}
            onChange={(value) => updateBackground({ style: value as any })}
            options={[
              { value: 'vibrant', label: 'Vibrant' },
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
              { value: 'professional', label: 'Professional' },
              { value: 'gaming', label: 'Gaming' },
              { value: 'minimal', label: 'Minimal' },
            ]}
          />
        </div>
        
        <TextArea
          label="Description"
          value={config.background.description || ''}
          onChange={(value) => updateBackground({ description: value })}
          placeholder="Additional background details..."
          rows={2}
        />
      </Section>

      {/* Style & Mood */}
      <Section title="Style & Mood" icon="✨">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Style"
            value={config.style}
            onChange={(value) => updateConfig({ style: value as any })}
            options={[
              { value: 'realistic', label: 'Realistic' },
              { value: 'cartoon', label: 'Cartoon' },
              { value: '3d', label: '3D' },
              { value: 'flat', label: 'Flat' },
              { value: 'painterly', label: 'Painterly' },
              { value: 'photographic', label: 'Photographic' },
            ]}
          />
          
          <Select
            label="Mood"
            value={config.mood}
            onChange={(value) => updateConfig({ mood: value as any })}
            options={[
              { value: 'energetic', label: 'Energetic' },
              { value: 'calm', label: 'Calm' },
              { value: 'mysterious', label: 'Mysterious' },
              { value: 'professional', label: 'Professional' },
              { value: 'playful', label: 'Playful' },
              { value: 'dramatic', label: 'Dramatic' },
            ]}
          />
          
          <Select
            label="Lighting"
            value={config.lighting}
            onChange={(value) => updateConfig({ lighting: value as any })}
            options={[
              { value: 'dramatic', label: 'Dramatic' },
              { value: 'soft', label: 'Soft' },
              { value: 'bright', label: 'Bright' },
              { value: 'moody', label: 'Moody' },
              { value: 'natural', label: 'Natural' },
              { value: 'studio', label: 'Studio' },
            ]}
          />
        </div>
        
        <Checkbox
          label="Clickbait Mode (Maximize engagement)"
          checked={config.clickbait || false}
          onChange={(checked) => updateConfig({ clickbait: checked })}
        />
      </Section>

      {/* Effects */}
      <Section title="Effects" icon="🎭">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Blur"
            value={config.effects.blur || 'none'}
            onChange={(value) => updateEffects({ blur: value as any })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'subtle', label: 'Subtle' },
              { value: 'heavy', label: 'Heavy' },
            ]}
          />
          
          <Select
            label="Glow"
            value={config.effects.glow || 'none'}
            onChange={(value) => updateEffects({ glow: value as any })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'soft', label: 'Soft' },
              { value: 'strong', label: 'Strong' },
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
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Checkbox
            label="Vignette"
            checked={config.effects.vignette || false}
            onChange={(checked) => updateEffects({ vignette: checked })}
          />
          
          <Checkbox
            label="Film Grain"
            checked={config.effects.grain || false}
            onChange={(checked) => updateEffects({ grain: checked })}
          />
        </div>
      </Section>
    </div>
  );
}

// ===== REUSABLE UI COMPONENTS =====

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

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
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

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
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

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
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
