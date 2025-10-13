"use client";

import React, { useState, useEffect } from "react";
// import ImageUploader from "../../components/ImageUploader";
import Scrollable from "./components/Scrollable";
import FixedTextarea from "./components/FixedTextarea";
import ImageGenerationHistory from "./components/ImageGenerationHistory";
import { getCurrentUser } from "@/utils/supabase/auth/user";
import { PRESETS, formatResolution } from "../../lib/presets";
import { AppUser, PresetKey, PresetAppend } from "../../types";

export default function HomePage() {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>(null);
  const [customPreset, setCustomPreset] = useState<string>("");
  const [user, setUser] = useState<AppUser>(null);
  const [loading, setLoading] = useState(true);

  // CHANGE: Replaced inline preset map with centralized PRESETS registry (lib/presets).
  // Use PRESETS[key].promptTemplate, ratio, and resolution across the app.

  // Typed preset key to align with registry and SidebarPresets
  function handlePresetSelect(key: PresetKey) {
    setSelectedPreset(key);
    if (key !== "other") setCustomPreset("");
  }

  function handleApplyCustom(text: string) {
    const t = text.trim();
    if (!t) return;
    setSelectedPreset("other");
    setCustomPreset(t);
  }

  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<string>("");
  const [submittedNotes, setSubmittedNotes] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedGeneratedIndex, setSelectedGeneratedIndex] =
    useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [loadedSession, setLoadedSession] = useState<{
    promptText: string;
    inputImages: string[];
    outputImages: string[];
  } | null>(null);

  const [presetAppend, setPresetAppend] = useState<PresetAppend | undefined>(undefined);



  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);



  // Preset UI badges for the input component (ratio + resolution tooltip)
  const aspectLabel =
    selectedPreset && selectedPreset !== "other"
      ? PRESETS[selectedPreset as PresetKey].ratio
      : undefined;
  const aspectTooltip =
    selectedPreset && selectedPreset !== "other"
      ? formatResolution(PRESETS[selectedPreset as PresetKey])
      : undefined;



  // Empty state: no results yet and nothing submitted
  const showEmpty =
    !isLoading && generatedImages.length === 0 && !submittedNotes;

  // Example prompts to help first-time users
  const examplePrompts = [
    "A serene mountain lake at golden hour, ultra-detailed, 4k",
    "Minimalist product shot of a smartwatch on marble, studio lighting",
    "Cute robot mascot waving on a gradient background, flat vector",
    "Cyberpunk city street in the rain, neon reflections, cinematic",
  ];

  // Callback handlers for components
  const handleResultsGenerated = (results: {
    submittedNotes: string;
    generatedImages: string[];
    savedNotes: string;
  }) => {
    setSubmittedNotes(results.submittedNotes);
    setGeneratedImages(results.generatedImages);
    setSavedNotes(results.savedNotes);
    if (results.generatedImages.length > 0) setSelectedGeneratedIndex(0);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  // Insert a prompt into the input (uses ImageUploader presetAppend bridge)
  const handleInsertPrompt = (txt: string) => {
    const t = txt.trim();
    if (!t) return;
    setPresetAppend({ text: t, nonce: Date.now() });
  };

  // Load a complete generation session from history
  const handleLoadSession = (promptData: {
    id: string;
    prompt_text: string | null;
    created_at: string;
    prompt_images?: Array<{ image_url: string; image_type: 'input' | 'output' }>;
  }) => {
    // Separate input and output images
    const inputImages = promptData.prompt_images?.filter(img => img.image_type === 'input').map(img => img.image_url) || [];
    const outputImages = promptData.prompt_images?.filter(img => img.image_type === 'output').map(img => img.image_url) || [];

    // Set the loaded session
    setLoadedSession({
      promptText: promptData.prompt_text || '',
      inputImages,
      outputImages,
    });

    // Also populate the results display
    setSubmittedNotes(promptData.prompt_text || '');
    setGeneratedImages(outputImages);
    setSavedNotes(promptData.prompt_text || '');
    if (outputImages.length > 0) setSelectedGeneratedIndex(0);

    // Optionally insert the prompt into textarea for editing/regeneration
    if (promptData.prompt_text) {
      setPresetAppend({ text: promptData.prompt_text, nonce: Date.now() });
    }
  };

  // Clear results handler
  const handleClearResults = () => {
    setGeneratedImages([]);
    setSubmittedNotes("");
    setSelectedGeneratedIndex(0);
    setLoadedSession(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Image Generation History Sidebar */}
      <ImageGenerationHistory
        onSelectPrompt={handleLoadSession}
      />

      <main className="h-screen pt-16 md:ml-80 flex flex-col">
        <Scrollable
          user={user}
          selectedPreset={selectedPreset}
          showEmpty={showEmpty}
          examplePrompts={examplePrompts}
          savedNotes={savedNotes}
          notes={notes}
          generatedImages={generatedImages}
          submittedNotes={submittedNotes}
          isLoading={isLoading}
          error={error}
          files={files}
          selectedGeneratedIndex={selectedGeneratedIndex}
          setSelectedGeneratedIndex={setSelectedGeneratedIndex}
          aspectRatio={aspectRatio}
          onInsertPrompt={handleInsertPrompt}
          onClearResults={handleClearResults}
          loadedSession={loadedSession}
        />
        <FixedTextarea
          files={files}
          setFiles={setFiles}
          notes={notes}
          setNotes={setNotes}
          aspectLabel={aspectLabel}
          aspectTooltip={aspectTooltip}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          user={user}
          selectedPreset={selectedPreset}
          customPreset={customPreset}
          onResultsGenerated={handleResultsGenerated}
          onError={handleError}
          onLoadingChange={handleLoadingChange}
          onSelectPreset={handlePresetSelect}
          onApplyCustomPreset={handleApplyCustom}
        />
      </main>
    </>
  );
}
