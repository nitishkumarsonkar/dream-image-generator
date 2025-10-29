/**
 * Instagram Post Preset Editor
 */

'use client';

import React from 'react';
import { InstagramPostConfig } from '@/types/presets';

interface InstagramPostEditorProps {
  config: InstagramPostConfig;
  onChange: (config: InstagramPostConfig) => void;
}

export default function InstagramPostEditor({
  config,
  onChange,
}: InstagramPostEditorProps) {
  const updateConfig = (updates: Partial<InstagramPostConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateSubject = (updates: Partial<InstagramPostConfig['subject']>) => {
    onChange({ ...config, subject: { ...config.subject, ...updates } });
  };

  const updateBackground = (updates: Partial<InstagramPostConfig['background']>) => {
    onChange({ ...config, background: { ...config.background, ...updates } });
  };

  const updateEffects = (updates: Partial<InstagramPostConfig['effects']>) => {
    onChange({ ...config, effects: { ...config.effects, ...updates } });
  };

  return (
    <div className="space-y-6">
      <Section title="Subject" icon="📸">
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        <TextArea
          label="Description"
          value={config.subject.description}
          onChange={(value) => updateSubject({ description: value })}
          placeholder="Describe the subject..."
          rows={2}
        />
      </Section>

      <Section title="Background" icon="🎨">
        <div className="grid grid-cols-2 gap-4">
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
              { value: 'minimal', label: 'Minimal' },
            ]}
          />
        </div>
      </Section>

      <Section title="Style & Composition" icon="✨">
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Style"
            value={config.style}
            onChange={(value) => updateConfig({ style: value as any })}
            options={[
              { value: 'minimal', label: 'Minimal' },
              { value: 'vibrant', label: 'Vibrant' },
              { value: 'aesthetic', label: 'Aesthetic' },
              { value: 'lifestyle', label: 'Lifestyle' },
              { value: 'professional', label: 'Professional' },
              { value: 'vintage', label: 'Vintage' },
            ]}
          />
          <Select
            label="Mood"
            value={config.mood}
            onChange={(value) => updateConfig({ mood: value as any })}
            options={[
              { value: 'happy', label: 'Happy' },
              { value: 'calm', label: 'Calm' },
              { value: 'energetic', label: 'Energetic' },
              { value: 'elegant', label: 'Elegant' },
              { value: 'fun', label: 'Fun' },
            ]}
          />
          <Select
            label="Composition"
            value={config.composition}
            onChange={(value) => updateConfig({ composition: value as any })}
            options={[
              { value: 'centered', label: 'Centered' },
              { value: 'rule-of-thirds', label: 'Rule of Thirds' },
              { value: 'golden-ratio', label: 'Golden Ratio' },
              { value: 'dynamic', label: 'Dynamic' },
            ]}
          />
        </div>
      </Section>

      <Section title="Effects" icon="🎭">
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Filter"
            value={config.filter || 'none'}
            onChange={(value) => updateConfig({ filter: value as any })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'warm', label: 'Warm' },
              { value: 'cool', label: 'Cool' },
              { value: 'vintage', label: 'Vintage' },
              { value: 'bright', label: 'Bright' },
              { value: 'muted', label: 'Muted' },
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
        <div className="grid grid-cols-2 gap-4 mt-4">
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
