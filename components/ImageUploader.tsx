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
  className?: string;
};

function ImageUploader({ onImageSelected, onImagesSelected, onTextChange, onSubmitText, initialText, maxSizeMB = 5, className }: ImageUploaderProps): JSX.Element {
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

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

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
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleOpenPicker}
          className="px-4 py-2 rounded-md bg-black text-white hover:bg-neutral-800 transition"
        >
          Choose Images
        </button>

        {previewUrls.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 rounded-md border hover:bg-neutral-50 transition"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 rounded-lg border bg-white p-3">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2">
            {previewUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {previewUrls.map((url, idx) => (
                  <div key={url} className="relative">
                    <img src={url} alt={`preview-${idx}`} className="w-full h-36 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => handleRemoveAt(idx)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-neutral-500">
                No image selected
              </div>
            )}
          </div>
          <div className="md:w-1/2">
            <label htmlFor="image-notes" className="block text-sm font-medium text-neutral-700 mb-2">Prompt</label>
            <textarea
              id="image-notes"
              value={text}
              onChange={handleTextChange}
              placeholder="Type here..."
              className="w-full h-48 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-neutral-300"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="px-4 py-2 rounded-md bg-black text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;
