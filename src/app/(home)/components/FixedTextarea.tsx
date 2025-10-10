"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import { FixedTextareaProps, PresetKey, PresetAppend } from "../../../types";
import { PRESETS } from "../../../lib/presets";
import { 
  readPromptHistory, 
  addPromptToHistory 
} from "../../../lib/promptHistory";

export default function FixedTextarea({
  files,
  setFiles,
  notes,
  setNotes,
  aspectLabel,
  aspectTooltip,
  aspectRatio,
  setAspectRatio,
  user,
  selectedPreset,
  customPreset,
  onResultsGenerated,
  onError,
  onLoadingChange,
}: FixedTextareaProps) {
  const [savedNotes, setSavedNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [presetAppend, setPresetAppend] = useState<PresetAppend | undefined>(undefined);

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
          const arrayBuffer = await f.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++)
            binary += String.fromCharCode(bytes[i]);
          const b64 = window.btoa(binary);
          imagesPayload.push({ mimeType: f.type || "image/png", data: b64 });
        }
      }

      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, images: imagesPayload, aspectRatio }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const message = err.error || err.message || "Server error";
        throw new Error(
          `${message}${err.detail ? " — " + JSON.stringify(err.detail) : ""}`
        );
      }

      const json = await resp.json();

      const extractParts = (obj: any) => {
        if (!obj) return [];
        if (Array.isArray(obj.parts)) return obj.parts;
        if (Array.isArray(obj.candidates) && obj.candidates.length > 0) {
          const c = obj.candidates[0];
          if (c?.content?.parts && Array.isArray(c.content.parts))
            return c.content.parts;
          if (
            c?.content &&
            typeof c.content === "object" &&
            (c.content.type || c.content.mimeType)
          ) {
            return [c.content];
          }
        }
        return [];
      };

      const rawParts = extractParts(json);
      const parts = rawParts.map((p: any) => {
        if (p && p.type === "image" && typeof p.data === "string") {
          const cleaned = p.data.replace(/\s+/g, "");
          return { ...p, data: cleaned };
        }
        return p;
      });

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

    setSavedNotes(t);
    setIsLoading(true);
    onLoadingChange(true);
    onError("");

    if (typeof window === "undefined") {
      onError("Cannot generate response on server side");
      setIsLoading(false);
      onLoadingChange(false);
      return;
    }

    try {
      const userPrompt = t.trim();
      if (!userPrompt) {
        throw new Error("Please enter some text before generating a response");
      }
      
      // Add to local history (de-duped, capped)
      setPromptHistory(addPromptToHistory(userPrompt));

      // Append preset template (or custom) to user's prompt at submit time.
      let append = "";
      if (selectedPreset === "other" && customPreset.trim()) {
        append = customPreset.trim();
      } else if (selectedPreset) {
        append = PRESETS[selectedPreset as PresetKey].promptTemplate;
      }
      const finalPrompt = append ? `${userPrompt}\n\n${append}` : userPrompt;

      const parts = await generateGeminiResponse(finalPrompt, files);

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

      onResultsGenerated({
        submittedNotes: texts.join("\n\n"),
        generatedImages: images,
        savedNotes: t,
      });
    } catch (err: any) {
      const errorMessage = err.message || "Unknown error occurred";
      onError(`Failed to generate response: ${errorMessage}`);
      console.error("Detailed API Error:", err);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
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
      />
    </div>
  );
}