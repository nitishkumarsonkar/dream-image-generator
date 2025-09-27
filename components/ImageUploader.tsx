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
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 240) + 'px'; // Max 10 lines (24px per line * 10)
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


      {/* <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        Max {maxImages} images, {maxSizeMB}MB each. Supported: PNG, JPG, GIF, etc. You have selected {previewUrls.length}/{maxImages}.
      </p> */}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="space-y-3 w-[80%] mx-auto">
        {/* Image previews */}
        {previewUrls.length > 0 && (
          <div className="flex gap-2 overflow-x-auto h-20 w-100%">
            {previewUrls.map((url, idx) => (
              <div key={url} className="relative flex-shrink-0">
                <img src={url} alt={`preview-${idx}`} className="h-20 w-20 object-cover rounded-md border border-neutral-200 dark:border-neutral-700" />
                <button
                  type="button"
                  onClick={() => handleRemoveAt(idx)}
                  className="absolute top-1 -right-1 bg-white dark:bg-neutral-800 rounded-full p-0.5 shadow border border-neutral-200 dark:border-neutral-700"
                  aria-label={`Remove image ${idx + 1}`}
                >
                  <span className="text-xs leading-none">✕</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea with action buttons */}
        <div className="space-y-3" >
          <div className="flex-1 relative rounded-xl border border-neutral-300 bg-white dark:bg-neutral-900">
            <textarea
              id="image-prompt"
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe your idea or roll the dice for prompt ideas"
              className="w-full min-h-[60px] max-h-[240px] text-neutral-900 dark:text-neutral-100 mt-2 placeholder-neutral-400 dark:placeholder-neutral-500 dark:bg-neutral-900 px-4 py-3 pr-32 focus:outline-none focus:ring-0 resize-none"
              style={{ height: 'auto' }}
            />


            {/* Icon buttons group inside textarea */}
            <div className=" w-full h-10 flex">
               {/* Main action button inside textarea */}
            <button
              type="button"
              onClick={handleOpenPicker}
              disabled={previewUrls.length >= maxImages || isSubmitting}
              className="absolute left-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3 w-3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h14M12 5l7 7-7 7" />
              </svg>
              <span className="text-xs font-medium">Add Images</span>
            </button>
            
              {/* Aspect ratio button */}
              <button
                type="button"
                className="h-6 w-6 absolute right-16 flex rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center justify-center transition-all duration-200 shadow-sm"
                title="Aspect ratio"
                
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3 w-3"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <path d="M9 9h6v6H9z"/>
                </svg>
              </button>

              {/* Settings button */}
              <button
                type="button"
                className="h-6 w-6 absolute right-10 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center justify-center transition-all duration-200 shadow-sm"
                title="Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3 w-3"
                >
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>

              {/* Submit button */}
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() || isSubmitting}
                className="h-6 w-6 absolute right-2 rounded-md bg-black text-white flex items-center justify-center hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                title="Submit prompt"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3 w-3"
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
