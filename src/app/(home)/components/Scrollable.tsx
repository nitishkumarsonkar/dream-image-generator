"use client";

import React, { useState } from "react";
import { PRESETS, formatResolution } from "../../../lib/presets";
import { ScrollableProps, PresetKey, Toast } from "../../../types";
import { copyDataUrlToClipboard, inferExtFromDataUrl, nowTs } from "../../../lib/share";

export default function Scrollable({
  user,
  selectedPreset,
  showEmpty,
  examplePrompts,
  savedNotes,
  notes,
  generatedImages,
  submittedNotes,
  isLoading,
  error,
  files,
  selectedGeneratedIndex,
  setSelectedGeneratedIndex,
  aspectRatio,
  onInsertPrompt,
  onClearResults,
}: ScrollableProps) {
  const [toast, setToast] = useState<Toast | null>(null);

  // Toast notification helper
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 2500);
  };

  // Utility functions
  const truncate = (s: string, max = 160) =>
    s.length > max ? s.slice(0, max - 1) + "…" : s;

  const makeAlt = (idx: number) => {
    const base = (savedNotes || "").trim() || "AI-generated image";
    const presetLabel = selectedPreset
      ? ` (${PRESETS[selectedPreset as PresetKey].label})`
      : "";
    return `Generated image ${idx + 1} — ${truncate(base)}${presetLabel}`;
  };

  const computeFilename = (dataUrl?: string) => {
    if (!dataUrl) return `dig-image-${nowTs()}.png`;
    const ext = inferExtFromDataUrl(dataUrl);
    const presetId = selectedPreset || "custom";
    const sizeTag = selectedPreset
      ? `${PRESETS[selectedPreset as PresetKey].width}x${
          PRESETS[selectedPreset as PresetKey].height
        }`
      : "auto";
    return `dig-${presetId}-${sizeTag}-${nowTs()}.${ext}`;
  };

  // Copy and share functions
  const copyImage = async (dataUrl?: string) => {
    try {
      if (!dataUrl) throw new Error("No image to copy");
      await copyDataUrlToClipboard(dataUrl);
      showToast("Image copied to clipboard");
    } catch (e: any) {
      showToast(e?.message || "Copy image failed", "error");
    }
  };

  const copyCaption = async () => {
    const t = (savedNotes || "").trim();
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
      showToast("Caption copied");
    } catch {
      showToast("Copy caption failed", "error");
    }
  };

  const handleCopyPrompt = async () => {
    const text = notes.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Prompt copied");
    } catch (e) {
      console.error("Copy prompt failed:", e);
      showToast("Copy prompt failed", "error");
    }
  };

  const handleClearResults = () => {
    onClearResults();
  };

  // Insert a prompt into the input
  const insertPrompt = (txt: string) => {
    const t = txt.trim();
    if (!t) return;
    onInsertPrompt(t);
  };

  // Immediately run a prompt without inserting first
  const runPrompt = (txt: string) => {
    const t = txt.trim();
    if (!t) return;
    // This would need to be passed as a prop if needed
    // void handleSave(t);
  };
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="app-container px-6 py-16">
        {/* Main content */}
        <section className="min-w-0">
          <header className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div>
                  {selectedPreset && (
                    <>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Preset will be appended internally on submit
                        {selectedPreset === "other"
                          ? ": custom snippet"
                          : ""}
                        .
                      </p>
                      {selectedPreset !== "other" && (
                        <div className="mt-2 flex gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                          <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 px-2 py-0.5">
                            {PRESETS[selectedPreset as PresetKey].ratio}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 px-2 py-0.5">
                            {formatResolution(
                              PRESETS[selectedPreset as PresetKey]
                            )}
                          </span>
                        </div>
                      )}
                      <div className="mt-2 flex gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 px-2 py-0.5">
                          Aspect: {aspectRatio}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {!user && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Sign in to generate images
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                You need to be signed in to generate images. You can browse
                the site freely, but authentication is required for image
                generation.
              </p>
              <div className="mt-3">
                <a
                  href="/sign-in"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Sign In
                </a>
              </div>
            </div>
          )}

          {showEmpty && user && (
            <div className="mt-4 p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <h3 className="text-lg font-semibold">Get started</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Enter a description, optionally add up to 5 images (≤5MB
                each), then submit.
              </p>

              <div className="mt-3">
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                  Example prompts
                </div>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      className="px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                      onClick={() => insertPrompt(p)}
                      title="Insert into prompt"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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

          {generatedImages.length > 0 && (
            <div className="mt-8">
              <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg shadow-sm text-sm text-neutral-700 dark:text-neutral-200">
                <div className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
                  Generated image preview
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-md bg-black/5 dark:bg-white/5 p-4 flex items-center justify-center">
                    <img
                      src={generatedImages[selectedGeneratedIndex]}
                      alt={makeAlt(selectedGeneratedIndex)}
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
                          alt={makeAlt(i)}
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
                    <button
                      type="button"
                      onClick={() =>
                        copyImage(generatedImages[selectedGeneratedIndex])
                      }
                      className="px-3 py-2 rounded-md border bg-white dark:border-neutral-700 dark:bg-neutral-900"
                      aria-label="Copy generated image to clipboard"
                    >
                      Copy image
                    </button>
                    <button
                      type="button"
                      onClick={copyCaption}
                      disabled={!savedNotes.trim()}
                      className="px-3 py-2 rounded-md border bg-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-900"
                      aria-label="Copy caption text"
                    >
                      Copy caption
                    </button>
                    <a
                      download={computeFilename(
                        generatedImages[selectedGeneratedIndex]
                      )}
                      href={generatedImages[selectedGeneratedIndex]}
                      className="px-3 py-2 rounded-md bg-black text-white"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-[100] rounded-md px-3 py-2 text-sm shadow-lg border ${
            toast?.type === "success"
              ? "bg-white text-neutral-800 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {toast?.msg}
        </div>
      )}
    </div>
  );
}