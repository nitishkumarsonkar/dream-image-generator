"use client";

import React, { useRef, useState } from "react";

interface ImageUploadModalProps {
  title: string;
  onImagesSelected: (files: File[]) => void;
  onRemove: (index: number) => void;
  selectedFiles: File[];
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUploadModal({
  title,
  onImagesSelected,
  onRemove,
  selectedFiles,
  maxImages = 5,
  maxSizeMB = 5,
}: ImageUploadModalProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Generate preview URLs for selected files
  React.useEffect(() => {
    // Clean up old preview URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    
    // Create new preview URLs
    const newUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newUrls);

    // Cleanup on unmount
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    const validFiles: File[] = [];

    // Check against total limit before processing
    if (selectedFiles.length + selected.length > maxImages) {
      setError(
        `Maximum of ${maxImages} images allowed. You have ${selectedFiles.length}; trying to add ${selected.length}.`
      );
      e.target.value = "";
      return;
    }

    for (const f of selected) {
      if (!f.type.startsWith("image/")) {
        setError("Please select only image files (PNG, JPG, GIF, etc.).");
        e.target.value = "";
        return;
      }

      if (f.size > maxBytes) {
        setError(`Each image must be ≤ ${maxSizeMB}MB.`);
        e.target.value = "";
        return;
      }

      validFiles.push(f);
    }

    setError(null);

    // Append to existing files
    const updatedFiles = [...selectedFiles, ...validFiles];
    onImagesSelected(updatedFiles);

    // Reset input
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    onRemove(index);
    setError(null);
  };

  const handleClearAll = () => {
    onImagesSelected([]);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {title}
        </label>
        {selectedFiles.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleOpenPicker}
          disabled={selectedFiles.length >= maxImages}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white shadow-lg shadow-primary-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Images ({selectedFiles.length}/{maxImages})
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Image Previews */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600 transition-colors">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 hover:scale-110 shadow-lg"
                aria-label={`Remove image ${index + 1}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50">
          <svg
            className="mx-auto h-10 w-10 text-neutral-400 dark:text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            No images selected. Click &quot;Upload Images&quot; to add some.
          </p>
        </div>
      )}
    </div>
  );
}
