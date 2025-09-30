import React, { useEffect, useRef, useState } from "react";

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
  aspectLabel?: string; // UI badge text e.g. "4:5"
  aspectTooltip?: string; // Hover text e.g. "1080×1350"
  presetAppend?: { text: string; nonce: number };
  className?: string;
};

function ImageUploader({
  onImageSelected,
  onImagesSelected,
  onTextChange,
  onSubmitText,
  initialText,
  maxSizeMB = 5,
  maxImages = 5,
  isSubmitting = false,
  aspectLabel,
  aspectTooltip,
  className,
  presetAppend,
}: ImageUploaderProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>(initialText ?? "");

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
      setError(
        `Maximum of ${maxImages} images allowed. You have ${files.length}; trying to add ${selected.length}.`
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
    if (inputRef.current) inputRef.current.value = "";
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
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 240) + "px"; // Max 10 lines (24px per line * 10)
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
    <div className={`image-uploader ${className || ""}`}>
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
        <p role="alert" className="image-uploader-error">
          {error}
        </p>
      )}

      <div className="uploader-inner">
        {/* Image previews */}
        {previewUrls.length > 0 && (
          <div className="preview-container">
            {previewUrls.map((url, idx) => (
              <div key={url} className="preview-item">
                <img src={url} alt={`preview-${idx}`} className="preview-img" />
                <button
                  type="button"
                  onClick={() => handleRemoveAt(idx)}
                  className="preview-remove"
                  aria-label={`Remove image ${idx + 1}`}
                >
                  <span className="remove-icon">✕</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea with action buttons */}
        <div className="textarea-container">
          <div className="prompt-wrapper">
            <textarea
              id="image-prompt"
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe your idea or roll the dice for prompt ideas"
              className="prompt-textarea"
              style={{ height: "auto" }}
            />

            {/* Icon buttons group inside textarea */}
            <div className="button-group">
              {/* Main action button inside textarea */}
              <button
                type="button"
                onClick={handleOpenPicker}
                disabled={previewUrls.length >= maxImages || isSubmitting}
                className="add-images-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="icon-svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 12h14M12 5l7 7-7 7"
                  />
                </svg>
                <span className="text-xs font-medium">Add Images</span>
              </button>

              {/* Aspect ratio button */}
              <button
                type="button"
                className="aspect-ratio-btn"
                title={aspectTooltip || "Aspect ratio"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="icon-svg"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M9 9h6v6H9z" />
                </svg>
                {aspectLabel && (
                  <span className="text-[10px] ml-1 opacity-80">
                    {aspectLabel}
                  </span>
                )}
              </button>

              {/* Settings button */}
              <button type="button" className="settings-btn" title="Settings">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="icon-svg"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() || isSubmitting}
                className="submit-btn"
                title="Submit prompt"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="icon-svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 12h14M12 5l7 7-7 7"
                  />
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
