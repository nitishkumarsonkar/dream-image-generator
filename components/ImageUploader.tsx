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
                  : "Describe your idea or roll the dice for prompt ideas"
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
                      width: 30,
                      height: 30,
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
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <path d="M9 9h6v6H9z" />
                    </svg>
                  </button>

                  {(aspectLabel || aspectRatio) && (
                    <span className="hidden sm:inline text-[10px] opacity-80 px-1.5 py-0.5 rounded-sm bg-neutral-200 dark:bg-neutral-800 whitespace-nowrap">
                      {aspectLabel || aspectRatio}
                    </span>
                  )}

                  {showAspectRatioPopup && (
                    <div
                      className="absolute bottom-full right-0 mb-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-lg z-50"
                      style={{
                        right: 0,
                        bottom: "100%",
                        marginBottom: 8,
                        minWidth: 240,
                        maxWidth: 420,
                        zIndex: 50,
                      }}
                    >
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
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
                              className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                                (aspectRatio || aspectLabel) === ratio.value
                                  ? "bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100"
                                  : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700"
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
                        <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Current: {aspectRatio || aspectLabel || "N/A"}
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
                  className="submit-bt shrink-0"
                  title={
                    disabled
                      ? "Please sign in to generate images"
                      : "Submit prompt"
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
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
                    <circle cx="12" cy="12" r="9" />
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
