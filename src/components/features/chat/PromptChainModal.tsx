"use client";

import React, { useState } from 'react';

interface PromptChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChain: (prompt: string) => void;
  isLoading?: boolean;
  sourceImage: string;
  sourcePrompt?: string;
}

export default function PromptChainModal({
  isOpen,
  onClose,
  onChain,
  isLoading = false,
  sourceImage,
  sourcePrompt
}: PromptChainModalProps) {
  const [chainPrompt, setChainPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chainPrompt.trim() && !isLoading) {
      onChain(chainPrompt.trim());
      setChainPrompt('');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setChainPrompt('');
      onClose();
    }
  };

  // Suggested refinement prompts
  const suggestions = [
    "Change the background to a magical forest",
    "Make it more photorealistic",
    "Add dramatic lighting",
    "Convert to watercolor painting style",
    "Add more vibrant colors",
    "Make it nighttime scene",
    "Add motion blur for dynamic feel",
    "Create a vintage film look"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l10 10M7 17l10-10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Refine This Image
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Describe how you'd like to modify the generated image
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Source Image Preview */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Current Image
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                <img
                  src={sourceImage}
                  alt="Source image for refinement"
                  className="w-full md:w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                />
              </div>
              {sourcePrompt && (
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    Original Prompt
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    {sourcePrompt}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Refinement Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="chainPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your refinement
              </label>
              <textarea
                id="chainPrompt"
                value={chainPrompt}
                onChange={(e) => setChainPrompt(e.target.value)}
                placeholder="E.g., 'change the background to a sunset', 'make it more realistic', 'add a magical glow'..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick suggestions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setChainPrompt(suggestion)}
                    disabled={isLoading}
                    className="text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!chainPrompt.trim() || isLoading}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Refining...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l10 10M7 17l10-10" />
                    </svg>
                    <span>Refine Image</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}