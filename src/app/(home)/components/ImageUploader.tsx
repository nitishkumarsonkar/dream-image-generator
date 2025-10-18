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
  disabled?: boolean; // New prop to disable the entire component
  aspectLabel?: string; // UI badge text e.g. "4:5"
  aspectTooltip?: string; // Hover text e.g. "1080×1350"
  aspectRatio?: string; // current aspect ratio (e.g., "16:9")
  onChangeAspectRatio?: (ratio: string) => void;
  presetAppend?: { text: string; nonce: number };
  onOpenPresets?: () => void; // New prop to open presets modal
  hasActivePreset?: boolean; // New prop to show active preset indicator
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
  disabled = false,
  aspectLabel,
  aspectTooltip,
  aspectRatio,
  onChangeAspectRatio,
  className,
  presetAppend,
  onOpenPresets,
  hasActivePreset = false,
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

  const [showAspectRatioPopup, setShowAspectRatioPopup] = useState(false);
  const arContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!showAspectRatioPopup) return;
      const target = event.target as Element;
      if (arContainerRef.current && !arContainerRef.current.contains(target)) {
        setShowAspectRatioPopup(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showAspectRatioPopup]);

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
              placeholder={
                disabled
                  ? "Please sign in to generate images..."
                  : "Example: A colourful animal or object with playful or surreal features – like a flamingo with expressive eyes balancing on one legs"
              }
              className="prompt-textarea"
              style={{ height: "auto" }}
              disabled={disabled}
            />
            <div
              className="relative button-group"
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                minHeight: 60,
                gap: 8,
              }}
            >
              {/* Left: Add Images */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={handleOpenPicker}
                  disabled={
                    previewUrls.length >= maxImages || isSubmitting || disabled
                  }
                  className="add-images-btn shrink-0"
                  title={
                    disabled ? "Please sign in to upload images" : "Add images"
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                  }}
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

                {/* Presets Button */}
                {onOpenPresets && (
                  <button
                    type="button"
                    onClick={onOpenPresets}
                    disabled={isSubmitting || disabled}
                    className="add-images-btn shrink-0 relative"
                    title="Choose preset"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      flexShrink: 0,
                    }}
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
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    <span className="text-xs font-medium">Presets</span>
                    {hasActivePreset && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full border-2 border-white dark:border-neutral-900 shadow-soft animate-pulse" />
                    )}
                  </button>
                )}
              </div>

              {/* Right: Aspect Ratio + Submit */}
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "nowrap",
                  whiteSpace: "nowrap",
                }}
              >
                {/* Aspect ratio button with popup */}
                <div
                  className="flex items-center gap-2 sm:w-auto"
                  ref={arContainerRef}
                  data-aspect-ratio-popup
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    className="aspect-ratio-btn shrink-0"
                    onClick={() => setShowAspectRatioPopup((v) => !v)}
                    aria-haspopup="dialog"
                    aria-expanded={showAspectRatioPopup}
                    title={aspectTooltip || "Aspect ratio"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 45,
                      height: 45,
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="icon-svg"
                      style={{ width: 36, height: 36 }}
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <path d="M9 9h6v6H9z" />
                    </svg>
                  </button>

                  {(aspectLabel || aspectRatio) && (
                    <span className="hidden sm:inline text-[20px] font-semibold opacity-90 px-2 py-1 rounded-md bg-gradient-to-r from-accent-100 to-accent-200 dark:from-accent-900/50 text-accent-700 dark:text-accent-500 border border-accent-300 dark:border-accent-800 whitespace-nowrap shadow-sm">
                      {aspectLabel || aspectRatio}
                    </span>
                  )}

                  {showAspectRatioPopup && (
                    <div
                      className="absolute bottom-full right-0 mb-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-xl border-2 border-primary-200 dark:border-primary-800 shadow-xl z-50"
                      style={{
                        right: 0,
                        bottom: "100%",
                        marginBottom: 8,
                        minWidth: 240,
                        maxWidth: 420,
                        zIndex: 50,
                      }}
                    >
                      <div className="p-4">
                        <h3 className="text-sm font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          </svg>
                          Aspect Ratio
                        </h3>
                        <div
                          className="grid grid-cols-2 gap-2"
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(160px, 1fr))",
                            gap: 8,
                          }}
                        >
                          {[
                            { value: "1:1", label: "Square (1:1)" },
                            { value: "4:3", label: "Standard (4:3)" },
                            { value: "16:9", label: "Widescreen (16:9)" },
                            { value: "3:2", label: "Photo (3:2)" },
                            { value: "21:9", label: "Ultrawide (21:9)" },
                            { value: "9:16", label: "Portrait (9:16)" },
                          ].map((ratio) => (
                            <button
                              key={ratio.value}
                              type="button"
                              onClick={() => {
                                onChangeAspectRatio?.(ratio.value);
                                setShowAspectRatioPopup(false);
                              }}
                              className={`px-3 py-2.5 text-xs font-semibold rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                                (aspectRatio || aspectLabel) === ratio.value
                                  ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white border-primary-500 shadow-soft-lg"
                                  : "bg-white text-neutral-700 border-primary-200 hover:bg-primary-50 hover:border-primary-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-primary-800 dark:hover:bg-primary-950/30 dark:hover:border-primary-700 shadow-soft"
                              }`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                lineHeight: 1.2,
                                textAlign: "left",
                              }}
                            >
                              {ratio.label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800">
                          <p className="text-xs font-medium text-primary-700 dark:text-primary-300 flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Current: <span className="font-bold">{aspectRatio || aspectLabel || "N/A"}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!text.trim() || isSubmitting || disabled}
                  className="submit-btn shrink-0"
                  title={
                    disabled
                      ? "Please sign in to generate images"
                      : "Submit prompt"
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 45,
                    height: 45,
                    borderRadius: "25%",
                    backgroundColor: "transparent",
                    border: "none",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="icon-svg"
                    style={{ width: 36, height: 36 }}
                  >
                    <line
                      x1="8"
                      y1="12"
                      x2="16"
                      y2="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="12,8 16,12 12,16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;
