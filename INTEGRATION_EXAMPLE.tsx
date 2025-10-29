/**
 * INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate the PresetManager into your home page.
 * Copy the relevant parts into src/app/(home)/page.tsx
 */

"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/utils/supabase/auth/user";
import { AppUser } from "@/types";
import { UserPreset } from "@/types/presets";
import { buildPromptFromPreset } from "@/lib/presetBuilder";
import PresetManager from "@/components/PresetManager";

export default function HomePage() {
  // === EXISTING STATE (keep your existing state) ===
  const [user, setUser] = useState<AppUser>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  // ... other existing state

  // === NEW STATE FOR PRESETS ===
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<UserPreset | null>(null);

  // === EXISTING USER LOAD (keep as is) ===
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  // === NEW: Handle preset selection ===
  const handlePresetSelect = (preset: UserPreset, userInput?: string) => {
    // Build the complete prompt from preset configuration + user input
    const fullPrompt = buildPromptFromPreset(
      preset.config,
      preset.category,
      userInput
    );

    // Update aspect ratio to match preset
    setAspectRatio(preset.aspect_ratio);

    // Set active preset (for showing indicator)
    setActivePreset(preset);

    // Insert the generated prompt
    // (Use your existing prompt insertion logic)
    handleInsertPrompt(fullPrompt);
    
    console.log("Generated prompt from preset:", fullPrompt);
  };

  // === EXISTING: Your prompt insertion function ===
  const handleInsertPrompt = (txt: string) => {
    // Your existing implementation
    // This appends text to the input
  };

  return (
    <div className="min-h-screen">
      {/* Your existing header, navigation, etc. */}

      <div className="container mx-auto p-4">
        {/* === ADD: Preset Button === */}
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Image Generation</h1>
          
          <button
            onClick={() => setIsPresetManagerOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            My Presets
            {activePreset && (
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Show active preset info */}
        {activePreset && (
          <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                Using preset: <strong>{activePreset.name}</strong>
              </span>
              <span className="text-xs text-primary-600 dark:text-primary-400">
                ({activePreset.aspect_ratio})
              </span>
            </div>
            <button
              onClick={() => setActivePreset(null)}
              className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
            >
              Clear
            </button>
          </div>
        )}

        {/* Your existing image generation UI */}
        {/* ... ImageUploader, chat, etc. ... */}

        {/* === ADD: PresetManager Modal === */}
        <PresetManager
          isOpen={isPresetManagerOpen}
          onClose={() => setIsPresetManagerOpen(false)}
          onSelectPreset={handlePresetSelect}
          userId={user?.id}
        />
      </div>
    </div>
  );
}

/**
 * ALTERNATIVE: Add to Existing Sidebar
 * 
 * If you have a sidebar with preset buttons, you can add:
 */

function SidebarWithPresets() {
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);

  return (
    <aside className="sidebar">
      {/* Your existing sidebar content */}
      
      {/* Add this button to your sidebar */}
      <button
        onClick={() => setIsPresetManagerOpen(true)}
        className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="font-medium">My Presets</span>
      </button>
      
      {/* Add PresetManager modal */}
      <PresetManager
        isOpen={isPresetManagerOpen}
        onClose={() => setIsPresetManagerOpen(false)}
        onSelectPreset={(preset, userInput) => {
          // Handle preset selection
        }}
        userId={user?.id}
      />
    </aside>
  );
}

/**
 * ALTERNATIVE: Add to ImageUploader Component
 * 
 * If you want the button directly in the ImageUploader:
 */

interface ImageUploaderProps {
  // ... existing props
  onOpenPresets?: () => void;
  hasActivePreset?: boolean;
}

function ImageUploaderWithPresets({
  onOpenPresets,
  hasActivePreset,
  // ... other props
}: ImageUploaderProps) {
  return (
    <div className="image-uploader">
      {/* Your existing upload UI */}
      
      {/* Add preset button */}
      {onOpenPresets && (
        <button
          onClick={onOpenPresets}
          className="preset-button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Presets</span>
          {hasActivePreset && (
            <span className="active-indicator">●</span>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Then in HomePage:
 */

function HomePageWithImageUploader() {
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<UserPreset | null>(null);

  return (
    <div>
      <ImageUploaderWithPresets
        onOpenPresets={() => setIsPresetManagerOpen(true)}
        hasActivePreset={!!activePreset}
        // ... other props
      />
      
      <PresetManager
        isOpen={isPresetManagerOpen}
        onClose={() => setIsPresetManagerOpen(false)}
        onSelectPreset={(preset, userInput) => {
          const prompt = buildPromptFromPreset(preset.config, preset.category, userInput);
          setActivePreset(preset);
          // Use prompt for generation
        }}
        userId={user?.id}
      />
    </div>
  );
}

/**
 * QUICK START STEPS:
 * 
 * 1. Run database migration:
 *    supabase db push
 * 
 * 2. Add imports to your home page:
 *    import PresetManager from "@/components/PresetManager";
 *    import { UserPreset } from "@/types/presets";
 *    import { buildPromptFromPreset } from "@/lib/presetBuilder";
 * 
 * 3. Add state:
 *    const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
 *    const [activePreset, setActivePreset] = useState<UserPreset | null>(null);
 * 
 * 4. Add handler:
 *    const handlePresetSelect = (preset, userInput) => {
 *      const prompt = buildPromptFromPreset(preset.config, preset.category, userInput);
 *      handleInsertPrompt(prompt);
 *    };
 * 
 * 5. Add button:
 *    <button onClick={() => setIsPresetManagerOpen(true)}>My Presets</button>
 * 
 * 6. Add component:
 *    <PresetManager
 *      isOpen={isPresetManagerOpen}
 *      onClose={() => setIsPresetManagerOpen(false)}
 *      onSelectPreset={handlePresetSelect}
 *      userId={user?.id}
 *    />
 * 
 * Done! 🎉
 */
