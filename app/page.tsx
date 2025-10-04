"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "../components/ImageUploader";
import SidebarPresets from "../components/SidebarPresets";
import { getCurrentUser } from "@/utils/supabase/auth/user";
import { User } from "@supabase/supabase-js";
import { PRESETS, PresetKey, formatResolution } from "../lib/presets";
import {
  readPromptHistory,
  addPromptToHistory,
  clearPromptHistory,
} from "../lib/promptHistory";
import {
  copyDataUrlToClipboard,
  inferExtFromDataUrl,
  nowTs,
} from "../lib/share";

export default function HomePage() {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>(null);
  const [customPreset, setCustomPreset] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // CHANGE: Replaced inline preset map with centralized PRESETS registry (lib/presets).
  // Use PRESETS[key].promptTemplate, ratio, and resolution across the app.

  // Typed preset key to align with registry and SidebarPresets
  function handlePresetSelect(key: PresetKey) {
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
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [showAspectRatioPopup, setShowAspectRatioPopup] = useState<boolean>(false);

  // Prompt history state + append bridge into the input component
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [presetAppend, setPresetAppend] = useState<
    { text: string; nonce: number } | undefined
  >(undefined);

  // Load history on mount (client only)
  useEffect(() => {
    setPromptHistory(readPromptHistory());
  }, []);

  // Close aspect ratio popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAspectRatioPopup) {
        const target = event.target as Element;
        if (!target.closest('[data-aspect-ratio-popup]')) {
          setShowAspectRatioPopup(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAspectRatioPopup]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
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
    // Check if user is authenticated
    if (!user) {
      setError("Please sign in to generate images");
      return;
    }

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
      // Add to local history (de-duped, capped)
      setPromptHistory(addPromptToHistory(userPrompt));

      // Append preset template (or custom) to user's prompt at submit time.
      let append = "";
      if (selectedPreset === "other" && customPreset.trim()) {
        append = customPreset.trim();
      } else if (selectedPreset) {
        append = PRESETS[selectedPreset].promptTemplate;
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

  // Preset UI badges for the input component (ratio + resolution tooltip)
  const aspectLabel =
    selectedPreset && selectedPreset !== "other"
      ? PRESETS[selectedPreset].ratio
      : undefined;
  const aspectTooltip =
    selectedPreset && selectedPreset !== "other"
      ? formatResolution(PRESETS[selectedPreset])
      : undefined;

  // Share helpers: toasts, alt text, filename and copy actions
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 2500);
  };

  const truncate = (s: string, max = 160) =>
    s.length > max ? s.slice(0, max - 1) + "…" : s;

  const makeAlt = (idx: number) => {
    const base = (savedNotes || "").trim() || "AI-generated image";
    const presetLabel = selectedPreset
      ? ` (${PRESETS[selectedPreset].label})`
      : "";
    return `Generated image ${idx + 1} — ${truncate(base)}${presetLabel}`;
  };

  const computeFilename = (dataUrl?: string) => {
    if (!dataUrl) return `dig-image-${nowTs()}.png`;
    const ext = inferExtFromDataUrl(dataUrl);
    const presetId = selectedPreset || "custom";
    const sizeTag = selectedPreset
      ? `${PRESETS[selectedPreset].width}x${PRESETS[selectedPreset].height}`
      : "auto";
    return `dig-${presetId}-${sizeTag}-${nowTs()}.${ext}`;
  };

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

  // Insert a prompt into the input (uses ImageUploader presetAppend bridge)
  const insertPrompt = (txt: string) => {
    const t = txt.trim();
    if (!t) return;
    setPresetAppend({ text: t, nonce: Date.now() });
  };

  // Immediately run a prompt without inserting first
  const runPrompt = (txt: string) => {
    const t = txt.trim();
    if (!t) return;
    void handleSave(t);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] z-30 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 overflow-y-auto">
        <SidebarPresets
          selectedKey={selectedPreset}
          onSelect={handlePresetSelect}
          onApplyCustom={handleApplyCustom}
        />
      </aside>

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

      <main className="h-screen pt-16 md:ml-64 flex flex-col">
        {" "}
        {/* Fixed height with flex layout */}
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="app-container px-6 py-16">
            {/* Main content */}
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

                  <div className="flex items-center gap-3">
                    <div>
                      {selectedPreset && (
                        <>
                          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            Preset will be appended internally on submit
                            {selectedPreset === "other" ? ": custom snippet" : ""}
                            .
                          </p>
                        {selectedPreset !== "other" && (
                          <div className="mt-2 flex gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                            <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 px-2 py-0.5">
                              {PRESETS[selectedPreset].ratio}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 px-2 py-0.5">
                              {formatResolution(PRESETS[selectedPreset])}
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
                    
                    {/* Aspect Ratio Button */}
                    <div className="relative" data-aspect-ratio-popup>
                      <button
                        type="button"
                        onClick={() => setShowAspectRatioPopup(!showAspectRatioPopup)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700"
                        aria-haspopup="dialog"
                        aria-expanded={showAspectRatioPopup}
                        title="Select aspect ratio"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                      </button>
                      
                      {/* Aspect Ratio Popup */}
                      {showAspectRatioPopup && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-lg z-50">
                          <div className="p-3">
                            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Aspect Ratio</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { value: "1:1", label: "Square (1:1)" },
                                { value: "4:3", label: "Standard (4:3)" },
                                { value: "16:9", label: "Widescreen (16:9)" },
                                { value: "3:2", label: "Photo (3:2)" },
                                { value: "21:9", label: "Ultrawide (21:9)" },
                                { value: "9:16", label: "Portrait (9:16)" }
                              ].map((ratio) => (
                                <button
                                  key={ratio.value}
                                  type="button"
                                  onClick={() => {
                                    setAspectRatio(ratio.value);
                                    setShowAspectRatioPopup(false);
                                  }}
                                  className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                                    aspectRatio === ratio.value
                                      ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100'
                                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700'
                                  }`}
                                >
                                  {ratio.label}
                                </button>
                              ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Current: {aspectRatio}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {!user && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Sign in to generate images</h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    You need to be signed in to generate images. You can browse the site freely, but authentication is required for image generation.
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

                  {/* <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Recent prompts
                      </div>
                      <button
                        type="button"
                        className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 underline-offset-2 hover:underline disabled:opacity-50"
                        onClick={() => {
                          clearPromptHistory();
                          setPromptHistory([]);
                        }}
                        disabled={promptHistory.length === 0}
                      >
                        Clear history
                      </button>
                    </div>
                    {promptHistory.length === 0 ? (
                      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        No prompts yet. Your recent prompts will appear here
                        after you generate.
                      </p>
                    ) : (
                      <ul className="mt-2 grid gap-2">
                        {promptHistory.map((h, idx) => (
                          <li
                            key={idx}
                            className="group flex items-start justify-between gap-3 rounded-md border border-neutral-200 dark:border-neutral-700 p-2"
                          >
                            <span className="text-sm text-neutral-700 dark:text-neutral-200 line-clamp-2">
                              {h}
                            </span>
                            <div className="shrink-0 flex gap-1">
                              <button
                                type="button"
                                className="px-2 py-1 text-xs rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                                onClick={() => insertPrompt(h)}
                                title="Use"
                              >
                                Use
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 text-xs rounded-md bg-black text-white dark:bg-white dark:text-black"
                                onClick={() => runPrompt(h)}
                                title="Run"
                              >
                                Run
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div> */}
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
        </div>
        {/* Fixed textarea at bottom */}
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
            disabled={!user}
          />
        </div>
      </main>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-[100] rounded-md px-3 py-2 text-sm shadow-lg border ${
            toast.type === "success"
              ? "bg-white text-neutral-800 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </>
  );
}
