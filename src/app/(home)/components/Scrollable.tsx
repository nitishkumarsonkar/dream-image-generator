"use client";

import React, { useState } from "react";
import { ScrollableProps, Toast, ChatMessage } from "../../../types";
import { copyDataUrlToClipboard, inferExtFromDataUrl, nowTs } from "../../../lib/share";
import ImageRefinementButton from "@/components/common/ImageRefinementButton";
import MarkdownText from "@/components/common/MarkdownText";

export default function Scrollable({
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
  onRefineImage, // New prop for refining images
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

  // Handle making an image public
  const handleMakePublic = async (imgUrl: string) => {
    try {
      // TODO: Implement the logic to make the image public
      // This could involve uploading to a public gallery, sharing to social media, etc.
      showToast("Feature coming soon! This will make the image publicly available.", "success");
    } catch (error) {
      showToast("Failed to make image public", "error");
    }
  };

  // Render chat message component
  const renderMessage = (message: ChatMessage) => {
    if (message.type === 'user') {
      return (
        <div key={message.id} className="flex justify-end mb-6">
          <div className="max-w-3xl">
            <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-br-sm">
              {message.text && (
                <div className="whitespace-pre-wrap break-words">{message.text}</div>
              )}
              {message.images && message.images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {message.images.map((imgUrl, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={`User image ${idx + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'assistant') {
      // Check if this is an error message
      const isError = message.text?.includes('❌') || message.text?.toLowerCase().includes('error');
      
      return (
        <div key={message.id} className="flex justify-start mb-6">
          <div className="max-w-3xl">
            <div className={`p-4 rounded-2xl rounded-bl-sm ${
              isError 
                ? 'bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800' 
                : 'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700'
            }`}>
              {message.isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span>Generating your image...</span>
                </div>
              ) : (
                <>
                  {message.text && (
                    <div className={`mb-3 ${
                      isError 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}>
                      <MarkdownText content={message.text} />
                    </div>
                  )}
                  {message.generatedImages && message.generatedImages.length > 0 && (
                    <div className="space-y-4">
                      {message.generatedImages.map((imgUrl, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          {/* Centered Image with Refinement Button */}
                          <div className="mb-3 relative group">
                            <img
                              src={imgUrl}
                              alt={`Generated image ${idx + 1}`}
                              className="max-w-full h-auto rounded-lg shadow-lg"
                              style={{ maxHeight: '500px' }}
                            />
                            {/* Refinement Button - shown on hover */}
                            {onRefineImage && (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <ImageRefinementButton
                                  onRefine={() => onRefineImage(imgUrl, message)}
                                  disabled={isLoading}
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons at Bottom */}
                          <div className="flex gap-2 flex-wrap justify-center">
                            <button
                              onClick={() => copyImage(imgUrl)}
                              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors text-sm"
                              title="Copy image to clipboard"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy Image
                            </button>
                            
                            <a
                              href={imgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors text-sm"
                              title="Open image in new tab"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Open New Tab
                            </a>
                            
                            <a
                              href={imgUrl}
                              download={computeFilename(imgUrl)}
                              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors text-sm"
                              title="Download image"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download
                            </a>
                            
                            <button
                              onClick={() => handleMakePublic?.(imgUrl)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm"
                              title="Make image public"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                              Make Public
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      );
    }
  };
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Clear messages button */}
        {messages.length > 0 && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={onClearMessages}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Generate New Image
            </button>
          </div>
        )}

        {/* Chat messages */}
        <div className="space-y-4">
          {messages.map(renderMessage)}
          
          {/* Loading message for current generation */}
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="max-w-3xl">
                <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span>Generating your image...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {showEmpty && (
          <div className="flex flex-col items-center py-10 w-full max-w-5xl mx-auto">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-800 to-neutral-900 dark:from-white dark:via-primary-200 dark:to-white bg-clip-text text-transparent mb-4 tracking-tight">
                Turn your imagination into reality
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                Enter a prompt below or choose an example to get started. 
                {!user && " Sign in to save your history."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {examplePrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="group relative p-6 text-left rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                  onClick={() => insertPrompt(p)}
                >
                  {/* Card Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-50/50 dark:to-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                      {['🏔️', '⌚', '🤖', '🌃'][i] || '✨'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {['Nature Scene', 'Product Photography', 'Character Design', 'Cyberpunk Art'][i] || 'Creative Idea'}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                        "{p}"
                      </p>
                    </div>
                  </div>
                  
                  {/* Arrow Icon */}
                  <div className="absolute bottom-6 right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
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