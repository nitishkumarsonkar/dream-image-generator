"use client";

import React, { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import SidebarPresets from "../components/SidebarPresets";

export default function HomePage() {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customPreset, setCustomPreset] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const PRESET_MAP: Record<string, string> = {
    instagram:
      "Create an Instagram-ready vertical image (1080x1350). High contrast, vibrant colors, crisp details, minimal background, subtle grain. Export as PNG.",
    ghibli:
      "Render in a Studio Ghibli-inspired style: soft pastels, painterly textures, warm sunlight, whimsical mood, gentle outlines, detailed nature background.",
    professional:
      "Create a professional studio-quality product photo. Neutral background, soft diffused lighting, high dynamic range, sharp focus, realistic color, 4k detail.",
  };

  function handlePresetSelect(key: string) {
    setSelectedPreset(key);
    if (key !== "other") setCustomPreset("");
    setMobileOpen(false);
  }

  function handleApplyCustom(text: string) {
    const t = text.trim();
    if (!t) return;
    setSelectedPreset("other");
    setCustomPreset(t);
    setMobileOpen(false);
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
        body: JSON.stringify({ prompt, images: imagesPayload }),
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

  // Utilities
  const handleCopyPrompt = async () => {
    const text = notes.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Copy prompt failed:", e);
    }
  };

  const handleClearResults = () => {
    setGeneratedImages([]);
    setSubmittedNotes("");
    setSelectedGeneratedIndex(0);
  };

  // Handler for when the user submits their input
  const handleSave = async (t: string) => {
    setSavedNotes(t);
    setIsLoading(true);
    setError("");

    if (typeof window === "undefined") {
      setError("Cannot generate response on server side");
      setIsLoading(false);
      return;
    }

    try {
      const userPrompt = t.trim();
      if (!userPrompt) {
        throw new Error("Please enter some text before generating a response");
      }

      let append = "";
      if (selectedPreset === "other" && customPreset.trim()) {
        append = customPreset.trim();
      } else if (selectedPreset && PRESET_MAP[selectedPreset]) {
        append = PRESET_MAP[selectedPreset];
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

      setSubmittedNotes(texts.join("\n\n"));
      setGeneratedImages(images);
      if (images.length > 0) setSelectedGeneratedIndex(0);
    } catch (err: any) {
      const errorMessage = err.message || "Unknown error occurred";
      setError(`Failed to generate response: ${errorMessage}`);
      console.error("Detailed API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen">
        <div className="app-container px-6 py-16">
          {/* Mobile sidebar drawer */}
          {mobileOpen && (
            <div className="md:hidden fixed inset-0 z-40">
              <div
                className="absolute inset-0 bg-black/40"
                aria-hidden="true"
                onClick={() => setMobileOpen(false)}
              />
              <aside
                id="mobile-sidebar"
                className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-3"
                aria-label="Sidebar presets"
              >
                <SidebarPresets
                  selectedKey={selectedPreset}
                  onSelect={handlePresetSelect}
                  onApplyCustom={handleApplyCustom}
                />
              </aside>
            </div>
          )}

          <div className="grid grid-cols-1 md:[grid-template-columns:16rem_1fr] gap-6 items-start">
            {/* Desktop sidebar (left column) */}
            <aside className="hidden md:block">
              <SidebarPresets
                selectedKey={selectedPreset}
                onSelect={handlePresetSelect}
                onApplyCustom={handleApplyCustom}
              />
            </aside>

            {/* Main content (right column) */}
            <section className="min-w-0">
              <header className="mb-6">
                <div className="flex items-center gap-3">
                  {/* Burger for mobile (open drawer) */}
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
                    aria-label="Open sidebar"
                    aria-controls="mobile-sidebar"
                    aria-expanded={mobileOpen ? "true" : "false"}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>

                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                      Generate Your Dream Image
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                      Select an image to see a live preview instantly. Supported
                      formats: PNG, JPG, GIF, etc.
                    </p>
                    {selectedPreset && (
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Preset will be appended internally on submit
                        {selectedPreset === "other" ? ": custom snippet" : ""}.
                      </p>
                    )}
                  </div>
                </div>
              </header>

              <ImageUploader
                onImagesSelected={setFiles}
                onTextChange={setNotes}
                onSubmitText={handleSave}
                isSubmitting={isLoading}
                maxImages={5}
                maxSizeMB={5}
              />

              {savedNotes && (
                <div className="mt-4 text-sm text-neutral-700 dark:text-neutral-200">
                  Saved Prompt:{" "}
                  <span className="font-medium">{savedNotes}</span>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      disabled={!notes.trim()}
                      className="px-3 py-1.5 rounded-md border bg-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      Copy prompt
                    </button>
                    <button
                      type="button"
                      onClick={handleClearResults}
                      disabled={generatedImages.length === 0 && !submittedNotes}
                      className="px-3 py-1.5 rounded-md border bg-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      Clear results
                    </button>
                  </div>
                </div>
              )}

              {isLoading && (
                <div
                  className="mt-4 p-3 bg-white dark:bg-neutral-900 rounded-lg shadow-sm text-sm text-neutral-700 dark:text-neutral-200"
                  role="status"
                  aria-live="polite"
                >
                  Generating response...
                </div>
              )}

              {error && (
                <div
                  className="mt-4 p-3 rounded-lg shadow-sm text-sm text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}

              {!isLoading && submittedNotes && (
                <div className="mt-4 p-3 bg-white dark:bg-neutral-900 rounded-lg shadow-sm text-sm text-neutral-700 dark:text-neutral-200">
                  Response:{" "}
                  <span className="font-medium">{submittedNotes}</span>
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
                  <p className="font-medium">Selected files:</p>
                  <ul className="mt-2 space-y-1">
                    {files.map((f, i) => (
                      <li key={`${f.name}-${i}`}>
                        {f.name} — {(f.size / (1024 * 1024)).toFixed(2)} MB —{" "}
                        {f.type || "Unknown"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {generatedImages.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-8">
          <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg shadow-sm text-sm text-neutral-700 dark:text-neutral-200">
            <div className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
              Generated image preview
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-md bg-black/5 dark:bg-white/5 p-4 flex items-center justify-center">
                <img
                  src={generatedImages[selectedGeneratedIndex]}
                  alt={`generated-${selectedGeneratedIndex}`}
                  className="max-h-[480px] w-full object-contain rounded-md"
                />
              </div>

              <div className="mt-3 flex gap-2">
                {generatedImages.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`rounded-md overflow-hidden border ${
                      i === selectedGeneratedIndex
                        ? "ring-2 ring-black dark:ring-white"
                        : ""
                    }`}
                    onClick={() => setSelectedGeneratedIndex(i)}
                  >
                    <img
                      src={src}
                      alt={`thumb-${i}`}
                      className="h-20 w-20 object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <a
                  href={generatedImages[selectedGeneratedIndex]}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-md border bg-white dark:border-neutral-700 dark:bg-neutral-900"
                >
                  Open in new tab
                </a>
                <a
                  download={`generated-${selectedGeneratedIndex}.png`}
                  href={generatedImages[selectedGeneratedIndex]}
                  className="px-3 py-2 rounded-md bg-black text-white"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
