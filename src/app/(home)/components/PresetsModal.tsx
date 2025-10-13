'use client';

import React, { useState } from 'react';
import { PRESETS, formatResolution } from '../../../lib/presets';
import { PresetKey } from '../../../types';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKey: PresetKey | null;
  onSelect: (key: PresetKey) => void;
  onApplyCustom?: (text: string) => void;
}

const ORDER: PresetKey[] = ['instagram', 'ghibli', 'professional', 'other'];

export default function PresetsModal({
  isOpen,
  onClose,
  selectedKey,
  onSelect,
  onApplyCustom,
}: PresetsModalProps): JSX.Element | null {
  const [customText, setCustomText] = useState('');

  if (!isOpen) return null;

  const handleApply = () => {
    const t = customText.trim();
    if (!t) return;
    onApplyCustom?.(t);
    setCustomText('');
    onClose();
  };

  const handleSelectPreset = (key: PresetKey) => {
    onSelect(key);
    if (key !== 'other') {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Choose a Preset
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid gap-3 md:grid-cols-2">
              {ORDER.map((key) => {
                const p = PRESETS[key];
                const label = p.label;
                const desc = p.desc;
                const active = selectedKey === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    aria-pressed={active ? 'true' : 'false'}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      active
                        ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-800'
                        : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-base font-semibold text-neutral-900 dark:text-white">
                          {label}
                        </div>
                        {desc && (
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {desc}
                          </div>
                        )}
                        {key !== 'other' && (
                          <div className="mt-2 flex gap-2 text-xs">
                            <span className="inline-flex items-center rounded-full bg-neutral-200 dark:bg-neutral-700 px-2.5 py-1 text-neutral-700 dark:text-neutral-300">
                              {p.ratio}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-neutral-200 dark:bg-neutral-700 px-2.5 py-1 text-neutral-700 dark:text-neutral-300">
                              {formatResolution(p)}
                            </span>
                          </div>
                        )}
                      </div>
                      {active && (
                        <svg className="w-5 h-5 text-neutral-900 dark:text-neutral-100 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Preset Input */}
            {selectedKey === 'other' && (
              <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <label
                  htmlFor="custom-preset-modal"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  Custom snippet to append
                </label>
                <textarea
                  id="custom-preset-modal"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Describe extra style, format, mood, etc."
                  className="w-full h-32 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm p-3 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none"
                  autoFocus
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={!customText.trim()}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    Apply Custom
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomText('')}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
              Select a preset to automatically enhance your image generation prompts
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
