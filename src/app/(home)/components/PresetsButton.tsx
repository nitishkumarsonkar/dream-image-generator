'use client';

import React from 'react';

interface PresetsButtonProps {
  onClick: () => void;
  hasActivePreset?: boolean;
}

export default function PresetsButton({
  onClick,
  hasActivePreset = false,
}: PresetsButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors text-sm font-medium"
      aria-label="Choose preset"
    >
      {/* Icon */}
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
      
      {/* Text */}
      <span>Presets</span>

      {/* Active indicator */}
      {hasActivePreset && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-neutral-900" />
      )}
    </button>
  );
}
