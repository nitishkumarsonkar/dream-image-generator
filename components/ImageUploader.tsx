import React, { useEffect, useRef, useState } from 'react';

type ImageUploaderProps = {
  onImageSelected?: (file: File) => void;
  onTextChange?: (text: string) => void;
  onSubmitText?: (text: string) => void;
  initialText?: string;
  maxSizeMB?: number;
  className?: string;
};

function ImageUploader({ onImageSelected, onTextChange, onSubmitText, initialText, maxSizeMB = 5, className }: ImageUploaderProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>(initialText ?? '');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, GIF, etc.).');
      e.target.value = '';
      return;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Image must be ≤ ${maxSizeMB}MB.`);
      e.target.value = '';
      return;
    }

    setError(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    onImageSelected?.(file);
  };

  const handleClear = () => {
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
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
          Choose Image
        </button>

        {previewUrl && (
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
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected preview"
                className="w-full h-auto rounded-md object-contain"
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-neutral-500">
                No image selected
              </div>
            )}
          </div>
          <div className="md:w-1/2">
            <label htmlFor="image-notes" className="block text-sm font-medium text-neutral-700 mb-2">Notes</label>
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
