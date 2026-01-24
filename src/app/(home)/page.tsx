"use client";

import React, { useState, useEffect } from "react";
// import ImageUploader from "../../components/ImageUploader";
import Scrollable from "./components/Scrollable";
import FixedTextarea from "./components/FixedTextareaChat";
import ImageGenerationHistory from "./components/ImageGenerationHistory";
import PromptChainModal from "@/components/features/chat/PromptChainModal";
import PresetManager from "@/components/features/presets/PresetManager";
import { getCurrentUser } from "@/utils/supabase/auth/user";
// import { PRESETS, formatResolution } from "../../lib/presets";
import { AppUser, PresetKey, PresetAppend, ChatMessage, UserPreset } from "../../types";
import { buildPromptFromPreset } from "../../lib/presetBuilder";

export default function HomePage() {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>(null);
  const [customPreset, setCustomPreset] = useState<string>("");
  const [user, setUser] = useState<AppUser>(null);
  const [loading, setLoading] = useState(true);

  // Chat state - replace individual states with messages array
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [presetAppend, setPresetAppend] = useState<PresetAppend | undefined>(undefined);

  // Prompt chaining state
  const [isChainModalOpen, setIsChainModalOpen] = useState(false);
  const [chainSourceImage, setChainSourceImage] = useState<string>("");
  const [chainSourceMessage, setChainSourceMessage] = useState<ChatMessage | null>(null);
  const [isChaining, setIsChaining] = useState(false);

  // Advanced Presets state
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const [activeAdvancedPreset, setActiveAdvancedPreset] = useState<UserPreset | null>(null);

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

  // Handle advanced preset selection
  const handleAdvancedPresetSelect = (preset: UserPreset, userInput?: string) => {
    try {
      // Build the complete prompt from preset configuration + user input
      const fullPrompt = buildPromptFromPreset(
        preset.config,
        preset.category,
        userInput
      );

      // Update aspect ratio to match preset
      setAspectRatio(preset.aspect_ratio);

      // Set active preset (for showing indicator)
      setActiveAdvancedPreset(preset);

      // Insert the generated prompt
      handleInsertPrompt(fullPrompt);
      
      console.log("Generated prompt from advanced preset:", fullPrompt);
    } catch (error) {
      console.error("Error applying advanced preset:", error);
    }
  };



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
  // const aspectLabel =
  //   selectedPreset && selectedPreset !== "other"
  //     ? PRESETS[selectedPreset as PresetKey].ratio
  //     : undefined;
  // const aspectTooltip =
  //   selectedPreset && selectedPreset !== "other"
  //     ? formatResolution(PRESETS[selectedPreset as PresetKey])
  //     : undefined;

  // Empty state: no messages yet
  const showEmpty = !isLoading && messages.length === 0;

  // Example prompts to help first-time users
  const examplePrompts = [
    "A serene mountain lake at golden hour, ultra-detailed, 4k",
    "Minimalist product shot of a smartwatch on marble, studio lighting",
    "Cute robot mascot waving on a gradient background, flat vector",
    "Cyberpunk city street in the rain, neon reflections, cinematic",
  ];

  // Handle new message from user input or AI response
  const handleMessageSent = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
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
    // Clear current messages
    setMessages([]);
    
    // Separate input and output images
    const inputImages = promptData.prompt_images?.filter(img => img.image_type === 'input').map(img => img.image_url) || [];
    const outputImages = promptData.prompt_images?.filter(img => img.image_type === 'output').map(img => img.image_url) || [];

    // Create chat messages from the loaded session
    const userMessage: ChatMessage = {
      id: `user-${promptData.id}`,
      type: 'user',
      timestamp: new Date(promptData.created_at),
      text: promptData.prompt_text || '',
      images: inputImages
    };

    const assistantMessage: ChatMessage = {
      id: `assistant-${promptData.id}`,
      type: 'assistant',
      timestamp: new Date(promptData.created_at),
      generatedImages: outputImages
    };

    setMessages([userMessage, assistantMessage]);

    // Optionally insert the prompt into textarea for editing/regeneration
    if (promptData.prompt_text) {
      setPresetAppend({ text: promptData.prompt_text, nonce: Date.now() });
    }
  };

  // Clear messages handler
  const handleClearMessages = () => {
    setMessages([]);
  };

  // Handler for initiating image refinement
  const handleRefineImage = (imageUrl: string, sourceMessage: ChatMessage) => {
    setChainSourceImage(imageUrl);
    setChainSourceMessage(sourceMessage);
    setIsChainModalOpen(true);
  };

  // Handler for executing the prompt chain
  const handleExecuteChain = async (refinementPrompt: string) => {
    if (!user || !chainSourceImage || !chainSourceMessage) {
      setError("Unable to refine image. Please try again.");
      return;
    }

    setIsChaining(true);
    setError("");

    try {
      // Create user message for the refinement request
      const userMessage: ChatMessage = {
        id: `user-chain-${Date.now()}`,
        type: 'user',
        timestamp: new Date(),
        text: `🔄 Refine: ${refinementPrompt}`,
        chainSourceId: chainSourceMessage.id,
      };

      setMessages(prev => [...prev, userMessage]);

      // Convert image URL to base64
      const response = await fetch(chainSourceImage);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(blob);
      });

      // Determine MIME type from blob
      const mimeType = blob.type || 'image/png';

      // Call the chain API
      const apiResponse = await fetch('/api/generate-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: refinementPrompt,
          previousImage: {
            mimeType: mimeType,
            data: base64,
          },
          sourcePromptId: chainSourceMessage.promptId,
          aspectRatio: aspectRatio,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error' }));
        
        // Handle specific error types
        if (apiResponse.status === 401) {
          throw new Error('Please sign in to refine images.');
        } else if (apiResponse.status === 402) {
          throw new Error(`Insufficient credits. You need ${errorData.requiredCredits || 5} credits to refine an image. Please purchase more credits to continue.`);
        } else if (apiResponse.status === 400) {
          throw new Error(errorData.error || 'Invalid refinement request. Please check your input and try again.');
        } else {
          throw new Error(errorData.error || `Server error (${apiResponse.status}). Please try again later.`);
        }
      }

      const data = await apiResponse.json();
      const parts = data.parts || [];

      // Extract generated images
      const images: string[] = [];
      if (Array.isArray(parts)) {
        for (const p of parts) {
          if (p.type === "image" && p.data) {
            let imgStr = String(p.data).trim();
            if (imgStr.startsWith("data:")) {
              images.push(imgStr);
            } else {
              imgStr = imgStr.replace(/\s+/g, "");
              if (imgStr.startsWith("base64,"))
                imgStr = imgStr.slice("base64,".length);
              const mime = p.mimeType || "image/png";
              images.push(`data:${mime};base64,${imgStr}`);
            }
          }
        }
      }

      // Create assistant message with refined images
      const assistantMessage: ChatMessage = {
        id: `assistant-chain-${Date.now()}`,
        type: 'assistant',
        timestamp: new Date(),
        generatedImages: images.length > 0 ? images : undefined,
        chainSourceId: chainSourceMessage.id,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Close the modal
      setIsChainModalOpen(false);
      setChainSourceImage("");
      setChainSourceMessage(null);

    } catch (err: any) {
      const errorMessage = err.message || "Unknown error occurred";
      
      // Create error message as an assistant reply
      const errorAssistantMessage: ChatMessage = {
        id: `error-chain-${Date.now()}`,
        type: 'assistant',
        timestamp: new Date(),
        text: `❌ **Refinement Failed**\n\n${errorMessage}`,
        chainSourceId: chainSourceMessage.id,
      };
      
      setMessages(prev => [...prev, errorAssistantMessage]);
      console.error("Detailed Chain API Error:", err);
      
      // Close the modal on error
      setIsChainModalOpen(false);
      setChainSourceImage("");
      setChainSourceMessage(null);
    } finally {
      setIsChaining(false);
    }
  };

  // Clear messages handler
  const handleCloseChainModal = () => {
    if (!isChaining) {
      setIsChainModalOpen(false);
      setChainSourceImage("");
      setChainSourceMessage(null);
    }
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

      <main className="h-screen pt-16 flex flex-col">
        {/* Advanced Presets Button - Fixed at top */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Image Generation
            </h2>
            
            {/* Show active preset indicator */}
            {activeAdvancedPreset && (
              <div className="px-3 py-1.5 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 border border-primary-200 dark:border-primary-800 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                  {activeAdvancedPreset.name}
                </span>
                <span className="text-xs text-primary-600 dark:text-primary-400">
                  ({activeAdvancedPreset.aspect_ratio})
                </span>
                <button
                  onClick={() => setActiveAdvancedPreset(null)}
                  className="ml-1 p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded transition-colors"
                  title="Clear preset"
                >
                  <svg className="w-3 h-3 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Advanced Presets Button */}
          <button
            onClick={() => setIsPresetManagerOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
            title="Open Advanced Presets Manager"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="hidden sm:inline">My Presets</span>
            {activeAdvancedPreset && (
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        <Scrollable
          user={user}
          selectedPreset={selectedPreset}
          showEmpty={showEmpty}
          examplePrompts={examplePrompts}
          messages={messages}
          isLoading={isLoading}
          error={error}
          aspectRatio={aspectRatio}
          onInsertPrompt={handleInsertPrompt}
          onClearMessages={handleClearMessages}
          onRefineImage={handleRefineImage}
        />
        <FixedTextarea
          // aspectLabel={aspectLabel}
          // aspectTooltip={aspectTooltip}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          user={user}
          selectedPreset={selectedPreset}
          customPreset={customPreset}
          onMessageSent={handleMessageSent}
          onError={handleError}
          onLoadingChange={handleLoadingChange}
          onSelectPreset={handlePresetSelect}
          onApplyCustomPreset={handleApplyCustom}
          presetAppend={presetAppend}
        />
      </main>

      {/* Prompt Chain Modal */}
      <PromptChainModal
        isOpen={isChainModalOpen}
        onClose={handleCloseChainModal}
        onChain={handleExecuteChain}
        isLoading={isChaining}
        sourceImage={chainSourceImage}
        sourcePrompt={chainSourceMessage?.text}
      />

      {/* Advanced Presets Manager Modal */}
      <PresetManager
        isOpen={isPresetManagerOpen}
        onClose={() => setIsPresetManagerOpen(false)}
        onSelectPreset={handleAdvancedPresetSelect}
        userId={user?.id}
      />
    </>
  );
}
