"use client";

import React, { useState } from "react";
import { ScrollableProps, Toast, ChatMessage } from "../../../types";
import { copyDataUrlToClipboard, inferExtFromDataUrl, nowTs } from "../../../lib/share";
import ImageRefinementButton from "../../../components/ImageRefinementButton";
import MarkdownText from "../../../components/MarkdownText";

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
          <div className="text-center py-12">
            <div className="mb-6">
              <svg className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
                Start creating amazing images
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {user 
                  ? "Enter a prompt below to generate your first image. You can also upload reference images to guide the AI."
                  : "Sign in to start generating AI-powered images with advanced presets and history tracking."
                }
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {examplePrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    className="px-3 py-2 rounded-lg border border-primary-200 dark:border-primary-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:border-primary-300 dark:hover:border-primary-700 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => insertPrompt(p)}
                    title="Click to insert into prompt"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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