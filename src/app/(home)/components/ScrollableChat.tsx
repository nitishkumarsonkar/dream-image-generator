"use client";

import React, { useState } from "react";
import { ScrollableProps, Toast, ChatMessage } from "../../../types";
import { copyDataUrlToClipboard, inferExtFromDataUrl, nowTs } from "../../../lib/share";

export default function ScrollableChat({
  user,
  selectedPreset,
  showEmpty,
  examplePrompts,
  messages,
  isLoading,
  error,
  aspectRatio,
  onInsertPrompt,
  onClearMessages,
}: ScrollableProps) {
  const [toast, setToast] = useState<Toast | null>(null);

  // Toast notification helper
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 2500);
  };

  const computeFilename = (dataUrl?: string) => {
    if (!dataUrl) return `dig-image-${nowTs()}.png`;
    const ext = inferExtFromDataUrl(dataUrl);
    return `dig-image-${nowTs()}.${ext}`;
  };

  // Copy image to clipboard
  const copyImage = async (dataUrl?: string) => {
    try {
      if (!dataUrl) throw new Error("No image to copy");
      await copyDataUrlToClipboard(dataUrl);
      showToast("Image copied to clipboard");
    } catch (e: any) {
      showToast(e?.message || "Copy image failed", "error");
    }
  };

  // Insert a prompt into the input
  const insertPrompt = (txt: string) => {
    const t = txt.trim();
    if (!t) return;
    onInsertPrompt(t);
  };

  // Render chat message component
  const renderMessage = (message: ChatMessage) => {
    if (message.type === 'user') {
      return (
        <div key={message.id} className="flex justify-end mb-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="max-w-3xl">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white p-5 rounded-3xl rounded-br-md shadow-lg shadow-indigo-500/20">
              {message.text && (
                <div className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</div>
              )}
              {message.images && message.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {message.images.map((imgUrl, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden ring-2 ring-white/20 hover:ring-white/40 transition-all">
                      <img
                        src={imgUrl}
                        alt={`User image ${idx + 1}`}
                        className="w-full h-28 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right font-medium">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'assistant') {
      return (
        <div key={message.id} className="flex justify-start mb-6 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="max-w-3xl">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800 border border-gray-200/60 dark:border-neutral-700/60 p-5 rounded-3xl rounded-bl-md shadow-xl shadow-gray-200/50 dark:shadow-black/20">
              {message.isLoading ? (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                  <span className="font-medium">Generating your image...</span>
                </div>
              ) : (
                <>
                  {message.generatedImages && message.generatedImages.length > 0 && (
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {message.generatedImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative group">
                            <div className="relative rounded-2xl overflow-hidden ring-2 ring-gray-300/50 dark:ring-neutral-600/50 group-hover:ring-indigo-500/60 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:shadow-indigo-500/20">
                              <img
                                src={imgUrl}
                                alt={`Generated image ${idx + 1}`}
                                className="w-full h-auto"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => copyImage(imgUrl)}
                                    className="p-3 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-xl shadow-lg hover:scale-110 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-all duration-200 group/btn"
                                    title="Copy image"
                                  >
                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-200 group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                  <a
                                    href={imgUrl}
                                    download={computeFilename(imgUrl)}
                                    className="p-3 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-xl shadow-lg hover:scale-110 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-all duration-200 group/btn"
                                    title="Download image"
                                  >
                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-200 group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full px-4 py-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-neutral-950 dark:to-neutral-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 text-red-700 dark:text-red-300 text-sm border border-red-200/60 dark:border-red-800/60 shadow-lg shadow-red-100/50 dark:shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{error}</span>
            </div>
          </div>
        )}

        {/* Clear messages button */}
        {messages.length > 0 && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={onClearMessages}
              className="group px-6 py-3 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate New Image
              </span>
            </button>
          </div>
        )}

        {/* Chat messages */}
        <div className="space-y-6">
          {messages.map(renderMessage)}
          
          {/* Loading message for current generation */}
          {isLoading && (
            <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="max-w-3xl">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/60 dark:border-indigo-800/60 p-5 rounded-3xl rounded-bl-md shadow-lg shadow-indigo-100/50 dark:shadow-black/20">
                  <div className="flex items-center gap-4 text-indigo-700 dark:text-indigo-300">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-6 w-6 border border-indigo-400 opacity-20"></div>
                    </div>
                    <span className="font-semibold">Generating your image...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {showEmpty && (
          <div className="text-center py-16 animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/40 dark:to-purple-950/40 p-6 rounded-3xl">
                  <svg className="h-16 w-16 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Start Creating Amazing Images
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {user 
                  ? "Enter a prompt below to generate your first image. You can also upload reference images to guide the AI."
                  : "Sign in to start generating AI-powered images with advanced presets and history tracking."
                }
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {examplePrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    className="group px-4 py-3 rounded-2xl border-2 border-indigo-200/60 dark:border-indigo-800/60 bg-gradient-to-br from-white to-indigo-50/50 dark:from-neutral-900 dark:to-indigo-950/20 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30 hover:scale-105 transition-all duration-300"
                    onClick={() => insertPrompt(p)}
                    title="Click to insert into prompt"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-500 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {p}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[100] rounded-2xl px-5 py-4 text-sm font-medium shadow-2xl border backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast?.type === "success"
              ? "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/90 dark:to-green-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 shadow-emerald-500/20"
              : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/90 dark:to-rose-950/90 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 shadow-red-500/20"
          }`}
        >
          <div className="flex items-center gap-3">
            {toast?.type === "success" ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{toast?.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}