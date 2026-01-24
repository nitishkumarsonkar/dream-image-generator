"use client";

import React from 'react';

interface ImageRefinementButtonProps {
  onRefine: () => void;
  disabled?: boolean;
}

export default function ImageRefinementButton({ onRefine, disabled = false }: ImageRefinementButtonProps) {
  return (
    <button
      onClick={onRefine}
      disabled={disabled}
      className="absolute top-2 right-2 px-3 py-2 bg-purple-600/90 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center space-x-2 backdrop-blur-sm"
      title="Refine this image with a new prompt"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l10 10M7 17l10-10" />
      </svg>
      <span>Refine</span>
    </button>
  );
}