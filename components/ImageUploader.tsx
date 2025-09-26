import React, { useEffect, useRef, useState } from 'react';

type ImageUploaderProps = {
  // Backwards-compatible single-file callback
  onImageSelected?: (file: File) => void;
  // New multi-file callback
  onImagesSelected?: (files: File[]) => void;
  onTextChange?: (text: string) => void;
  onSubmitText?: (text: string) => void;
  initialText?: string;
  maxSizeMB?: number;
  maxImages?: number; // New prop for max images limit
  isSubmitting?: boolean; // New prop to disable submit during loading
  presetAppend?: { text: string; nonce: number };
  className?: string;
};

function ImageUploader({ onImageSelected, onImagesSelected, onTextChange, onSubmitText, initialText, maxSizeMB = 5, maxImages = 5, isSubmitting = false, className, presetAppend }: ImageUploaderProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>(initialText ?? '');

  useEffect(() => {
    return () => {
      // cleanup all object URLs on unmount
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (!presetAppend || !presetAppend.text) return;
    setText((prev) => {
      const next = prev ? `${prev}\n\n${presetAppend.text}` : presetAppend.text;
      onTextChange?.(next);
      return next;
    });
    // Only run when a new append is triggered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetAppend?.nonce]);

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    // Check against total limit before processing
    if (files.length + selected.length > maxImages) {
      setError(`Maximum of ${maxImages} images allowed. You have ${files.length}; trying to add ${selected.length}.`);
      e.target.value = '';
      return;
    }

    for (const f of selected) {
      if (!f.type.startsWith('image/')) {
        setError('Please select only image files (PNG, JPG, GIF, etc.).');
        e.target.value = '';
        return;
      }

      if (f.size > maxBytes) {
        setError(`Each image must be ≤ ${maxSizeMB}MB.`);
        e.target.value = '';
        return;
      }

      validFiles.push(f);
      newPreviewUrls.push(URL.createObjectURL(f));
    }

    setError(null);

    // append to existing files (keep previous selection)
    const updatedFiles = [...files, ...validFiles];
    const updatedPreviews = [...previewUrls, ...newPreviewUrls];

    setFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);

    // Callbacks
    // For backwards compatibility, call onImageSelected with the first newly selected file
    if (validFiles[0]) onImageSelected?.(validFiles[0]);
    onImagesSelected?.(updatedFiles);
  };

  const handleClear = () => {
    setError(null);
    // revoke all
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
    setFiles([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemoveAt = (index: number) => {
    const url = previewUrls[index];
    if (url) URL.revokeObjectURL(url);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);
    setFiles(newFiles);
    onImagesSelected?.(newFiles);
    // Keep backward compatibility: if after removal there's at least one file, call onImageSelected with first
    if (newFiles[0]) onImageSelected?.(newFiles[0]);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    onTextChange?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const value = text.trim();
      if (!value || isSubmitting) return;
      onSubmitText?.(value);
    }
  };

  const handleSubmit = () => {
    const value = text.trim();
    if (!value) return;
    onSubmitText?.(value);
  };

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <input
        ref={inputRef}
        id="image-input"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />


      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        Max {maxImages} images, {maxSizeMB}MB each. Supported: PNG, JPG, GIF, etc. You have selected {previewUrls.length}/{maxImages}.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="mt-6 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 p-3">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2">
            {/* <label htmlFor="image-notes" className="block text-sm font-medium text-neutral-700 mb-2">Prompt</label> */}
            <div className="relative">
              {previewUrls.length > 0 && (
                <div className="absolute top-2 left-2 right-2 flex gap-2 overflow-x-auto h-12 items-center">
                  {previewUrls.map((url, idx) => (
                    <div key={url} className="relative flex-shrink-0">
                      <img src={url} alt={`preview-${idx}`} className="h-10 w-10 object-cover rounded-md border border-neutral-200 dark:border-neutral-700" />
                      <button
                        type="button"
                        onClick={() => handleRemoveAt(idx)}
                        className="absolute -top-1 -right-1 bg-white dark:bg-neutral-800 rounded-full p-0.5 shadow border border-neutral-200 dark:border-neutral-700"
                        aria-label={`Remove image ${idx + 1}`}
                      >
                        <span className="text-xs leading-none">✕</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <textarea
                id="image-notes"
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Type here..."
                className="w-full h-48 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 p-2 pt-16 pr-14 pl-14 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
              />
              <button
                type="button"
                onClick={handleOpenPicker}
                disabled={previewUrls.length >= maxImages || isSubmitting}
                aria-label="Add images"
                title="Add images"
                className="absolute bottom-2 left-2 h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-neutral-100 flex items-center justify-center shadow hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <span className="text-lg leading-none">+</span>
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() || isSubmitting}
                aria-label="Submit prompt"
                title="Submit (Enter). Shift+Enter for newline."
                className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-black text-white flex items-center justify-center shadow hover:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;
