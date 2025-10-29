/**
 * PresetManager Component
 * 
 * Main interface for managing user presets - create, edit, delete, and use presets
 * Provides a comprehensive modal with template selection and detailed configuration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  UserPreset, 
  PresetCategory,
  YouTubeThumbnailConfig,
  InstagramPostConfig,
  ProductPhotoConfig,
} from '@/types/presets';
import { PRESET_TEMPLATES, getTemplatesByCategory, getAvailableCategories } from '@/lib/presetTemplates';
import YouTubeThumbnailEditor from './presetEditors/YouTubeThumbnailEditor';
import InstagramPostEditor from './presetEditors/InstagramPostEditor';
import ProductPhotoEditor from './presetEditors/ProductPhotoEditor';
import { buildPromptFromPreset } from '@/lib/presetBuilder';

interface PresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: UserPreset, userInput?: string) => void;
  userId?: string;
}

export default function PresetManager({
  isOpen,
  onClose,
  onSelectPreset,
  userId,
}: PresetManagerProps) {
  const [view, setView] = useState<'list' | 'templates' | 'edit'>('list');
  const [presets, setPresets] = useState<UserPreset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editingPreset, setEditingPreset] = useState<UserPreset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load user presets
  useEffect(() => {
    if (isOpen && userId) {
      loadPresets();
    }
  }, [isOpen, userId]);

  const loadPresets = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_presets')
        .select('*')
        .eq('user_id', userId)
        .order('is_favorite', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPresets(data || []);
    } catch (error) {
      console.error('Error loading presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFromTemplate = (templateKey: string) => {
    const template = PRESET_TEMPLATES[templateKey];
    if (!template) return;

    const newPreset: Partial<UserPreset> = {
      user_id: userId!,
      name: template.name,
      description: template.description,
      category: template.category,
      aspect_ratio: template.defaultDimensions.aspect_ratio,
      width: template.defaultDimensions.width,
      height: template.defaultDimensions.height,
      config: template.defaultConfig as any,
      is_favorite: false,
      usage_count: 0,
    };

    setEditingPreset(newPreset as UserPreset);
    setView('edit');
  };

  const handleSavePreset = async (preset: UserPreset) => {
    try {
      const supabase = createClient();
      
      // Generate prompt from config
      const generatedPrompt = buildPromptFromPreset(preset.config, preset.category);
      
      const presetData = {
        ...preset,
        generated_prompt: generatedPrompt,
      };

      let savedPreset;
      
      if (preset.id) {
        // Update existing
        const { data, error } = await supabase
          .from('user_presets')
          .update(presetData)
          .eq('id', preset.id)
          .select()
          .single();
        
        if (error) throw error;
        savedPreset = data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('user_presets')
          .insert([presetData])
          .select()
          .single();
        
        if (error) throw error;
        savedPreset = data;
      }

      await loadPresets();
      setView('list');
      setEditingPreset(null);
      
      return savedPreset;
    } catch (error) {
      console.error('Error saving preset:', error);
      throw error;
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (!confirm('Are you sure you want to delete this preset?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_presets')
        .delete()
        .eq('id', presetId);

      if (error) throw error;
      await loadPresets();
    } catch (error) {
      console.error('Error deleting preset:', error);
    }
  };

  const handleToggleFavorite = async (preset: UserPreset) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_presets')
        .update({ is_favorite: !preset.is_favorite })
        .eq('id', preset.id);

      if (error) throw error;
      await loadPresets();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleUsePreset = async (preset: UserPreset, userInput?: string) => {
    try {
      // Increment usage count
      const supabase = createClient();
      await supabase
        .from('user_presets')
        .update({ usage_count: preset.usage_count + 1 })
        .eq('id', preset.id);

      onSelectPreset(preset, userInput);
      onClose();
    } catch (error) {
      console.error('Error using preset:', error);
    }
  };

  const filteredPresets = presets.filter(preset =>
    preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preset.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              {view === 'list' && 'My Presets'}
              {view === 'templates' && 'Choose a Template'}
              {view === 'edit' && (editingPreset?.id ? 'Edit Preset' : 'Create Preset')}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {view === 'list' && 'Create detailed, reusable image generation templates'}
              {view === 'templates' && 'Start with a professional template'}
              {view === 'edit' && 'Configure every detail of your preset'}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' && (
            <PresetList
              presets={filteredPresets}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isLoading={isLoading}
              onCreateNew={() => setView('templates')}
              onEdit={(preset) => {
                setEditingPreset(preset);
                setView('edit');
              }}
              onDelete={handleDeletePreset}
              onToggleFavorite={handleToggleFavorite}
              onUse={handleUsePreset}
            />
          )}

          {view === 'templates' && (
            <TemplateSelector
              onSelectTemplate={handleCreateFromTemplate}
              onBack={() => setView('list')}
            />
          )}

          {view === 'edit' && editingPreset && (
            <PresetEditor
              preset={editingPreset}
              onSave={handleSavePreset}
              onCancel={() => {
                setView('list');
                setEditingPreset(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ===== SUB-COMPONENTS =====

interface PresetListProps {
  presets: UserPreset[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
  onCreateNew: () => void;
  onEdit: (preset: UserPreset) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (preset: UserPreset) => void;
  onUse: (preset: UserPreset, userInput?: string) => void;
}

function PresetList({
  presets,
  searchQuery,
  onSearchChange,
  isLoading,
  onCreateNew,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUse,
}: PresetListProps) {
  const [selectedPreset, setSelectedPreset] = useState<UserPreset | null>(null);
  const [userInput, setUserInput] = useState('');

  return (
    <div className="space-y-4">
      {/* Search and Create */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-3 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <button
          onClick={onCreateNew}
          className="px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Preset
        </button>
      </div>

      {/* Presets Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : presets.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-950/30 dark:to-accent-950/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            No presets yet
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Create your first preset to streamline your image generation
          </p>
          <button
            onClick={onCreateNew}
            className="px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="group relative bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg p-4"
            >
              {/* Favorite Badge */}
              <button
                onClick={() => onToggleFavorite(preset)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <svg
                  className={`w-5 h-5 ${preset.is_favorite ? 'text-yellow-500 fill-current' : 'text-neutral-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>

              {/* Content */}
              <div className="pr-8">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  {preset.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-2">
                  {preset.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                  <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                    {preset.category.replace('_', ' ')}
                  </span>
                  <span>{preset.aspect_ratio}</span>
                  <span>•</span>
                  <span>Used {preset.usage_count}x</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedPreset(preset);
                    setUserInput('');
                  }}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Use Preset
                </button>
                <button
                  onClick={() => onEdit(preset)}
                  className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(preset.id)}
                  className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 transition-colors group"
                >
                  <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Use Preset Modal */}
      {selectedPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Use Preset: {selectedPreset.name}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Enter the core details for your image:
            </p>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`Example: "Top 10 Gaming Moments"`}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedPreset(null)}
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUse(selectedPreset, userInput);
                  setSelectedPreset(null);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TemplateSelectorProps {
  onSelectTemplate: (templateKey: string) => void;
  onBack: () => void;
}

function TemplateSelector({ onSelectTemplate, onBack }: TemplateSelectorProps) {
  const categories = getAvailableCategories();

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to My Presets
      </button>

      {categories.map((category) => {
        const templates = getTemplatesByCategory(category.id);
        
        return (
          <div key={category.id} className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="text-2xl">{category.icon}</span>
              {category.name}
              <span className="text-sm font-normal text-neutral-500">
                ({category.count} templates)
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, idx) => {
                const templateKey = Object.keys(PRESET_TEMPLATES).find(
                  k => PRESET_TEMPLATES[k] === template
                );
                
                return (
                  <button
                    key={idx}
                    onClick={() => templateKey && onSelectTemplate(templateKey)}
                    className="text-left p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{template.icon}</span>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {template.name}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    
                    {template.examples && template.examples.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
                          Examples:
                        </p>
                        {template.examples.slice(0, 2).map((example, i) => (
                          <p key={i} className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                            • {example}
                          </p>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface PresetEditorProps {
  preset: UserPreset;
  onSave: (preset: UserPreset) => Promise<any>;
  onCancel: () => void;
}

function PresetEditor({ preset, onSave, onCancel }: PresetEditorProps) {
  const [editedPreset, setEditedPreset] = useState<UserPreset>(preset);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedPreset);
    } catch (error) {
      console.error('Error saving preset:', error);
      alert('Failed to save preset');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Preset Name
          </label>
          <input
            type="text"
            value={editedPreset.name}
            onChange={(e) => setEditedPreset({ ...editedPreset, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., My YouTube Gaming Template"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Description
          </label>
          <textarea
            value={editedPreset.description || ''}
            onChange={(e) => setEditedPreset({ ...editedPreset, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={2}
            placeholder="Describe your preset..."
          />
        </div>
      </div>

      {/* Category-specific editor */}
      {editedPreset.category === 'youtube_thumbnail' && (
        <YouTubeThumbnailEditor
          config={editedPreset.config as YouTubeThumbnailConfig}
          onChange={(config: YouTubeThumbnailConfig) => setEditedPreset({ ...editedPreset, config })}
        />
      )}
      
      {editedPreset.category === 'instagram_post' && (
        <InstagramPostEditor
          config={editedPreset.config as InstagramPostConfig}
          onChange={(config: InstagramPostConfig) => setEditedPreset({ ...editedPreset, config })}
        />
      )}
      
      {editedPreset.category === 'product_photo' && (
        <ProductPhotoEditor
          config={editedPreset.config as ProductPhotoConfig}
          onChange={(config: ProductPhotoConfig) => setEditedPreset({ ...editedPreset, config })}
        />
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Preset'}
        </button>
      </div>
    </div>
  );
}
