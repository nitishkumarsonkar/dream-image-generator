"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
// import PresetsModal from "./PresetsModal";
import { FixedTextareaProps, PresetKey, PresetAppend, ChatMessage } from "@/types";
// import { PRESETS } from "../../../lib/presets";
import { 
  readPromptHistory, 
  addPromptToHistory 
} from "@/lib/promptHistory";

export default function FixedTextareaChat({
  aspectLabel,
  aspectTooltip,
  aspectRatio,
  setAspectRatio,
  user,
  selectedPreset,
  customPreset,
  onMessageSent,
  onError,
  onLoadingChange,
  onSelectPreset,
  onApplyCustomPreset,
  presetAppend,
}: FixedTextareaProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);

  // Load prompt history on mount
  useEffect(() => {
    setPromptHistory(readPromptHistory());
  }, []);

  // Function to generate response using Gemini API
  const generateGeminiResponse = async (
    prompt: string,
    imageFiles?: File[]
  ) => {
    try {
      const imagesPayload: Array<{ mimeType: string; data: string }> = [];
      if (imageFiles && imageFiles.length > 0) {
        for (const f of imageFiles) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(f);
          });
          imagesPayload.push({
            mimeType: f.type,
            data: base64,
          });
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          images: imagesPayload,
          aspectRatio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Handle specific error types
        if (response.status === 401) {
          throw new Error('Please sign in to generate images.');
        } else if (response.status === 402) {
          throw new Error(`Insufficient credits. You need ${errorData.requiredCredits || 5} credits to generate an image. Please purchase more credits to continue.`);
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid request. Please check your prompt and try again.');
        } else {
          throw new Error(errorData.error || `Server error (${response.status}). Please try again later.`);
        }
      }

      const data = await response.json();
      const parts = data.parts || [];

      return parts;
    } catch (err) {
      console.error("Client generate error:", err);
      throw err;
    }
  };

  // Handler for when the user submits their input
  const handleSave = async (t: string) => {
    // Check if user is authenticated
    if (!user) {
      onError("Please sign in to generate images");
      return;
    }

    const userPrompt = t.trim();
    if (!userPrompt && files.length === 0) {
      onError("Please enter some text or upload an image before generating");
      return;
    }

    setIsLoading(true);
    onLoadingChange(true);
    onError("");

    try {
      // Create user message
      const userImages: string[] = [];
      for (const file of files) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        userImages.push(dataUrl);
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        timestamp: new Date(),
        text: userPrompt || undefined,
        images: userImages.length > 0 ? userImages : undefined,
      };

      // Send user message immediately
      onMessageSent(userMessage);

      // Clear the input
      setNotes("");
      setFiles([]);

      // Add to local history if there's text
      if (userPrompt) {
        setPromptHistory(addPromptToHistory(userPrompt));
      }

    //   // Append preset template (or custom) to user's prompt at submit time.
    //   let append = "";
    //   if (selectedPreset === "other" && customPreset.trim()) {
    //     append = customPreset.trim();
    //   } else if (selectedPreset) {
    //     append = PRESETS[selectedPreset as PresetKey].promptTemplate;
    //   }
    //   const finalPrompt = append ? `${userPrompt}\n\n${append}` : userPrompt;

      const parts = await generateGeminiResponse(userPrompt, files.length > 0 ? files : undefined);

      const texts: string[] = [];
      const images: string[] = [];
      if (Array.isArray(parts)) {
        for (const p of parts) {
          if (p.type === "text" && p.text) texts.push(p.text);

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

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        timestamp: new Date(),
        text: texts.length > 0 ? texts.join("\n\n") : undefined,
        generatedImages: images.length > 0 ? images : undefined,
      };

      onMessageSent(assistantMessage);

    } catch (err: any) {
      const errorMessage = err.message || "Unknown error occurred";
      
      // Create error message as an assistant reply
      const errorAssistantMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        timestamp: new Date(),
        text: `❌ **Generation Failed**\n\n${errorMessage}`,
      };
      
      onMessageSent(errorAssistantMessage);
      console.error("Detailed API Error:", err);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <>
      <div className="p-4">
        <ImageUploader
          onImagesSelected={setFiles}
          onTextChange={setNotes}
          onSubmitText={handleSave}
          isSubmitting={isLoading}
          maxImages={5}
          maxSizeMB={5}
          aspectLabel={aspectLabel}
          aspectTooltip={aspectTooltip}
          presetAppend={presetAppend}
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
          disabled={!user}
          hasActivePreset={selectedPreset !== null}
        />
      </div>
    </>
  );
}