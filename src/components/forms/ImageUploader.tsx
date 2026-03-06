"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploaderProps {
  value: string;
  onChange: (path: string) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setError("");
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Upload failed");
          return;
        }

        onChange(data.path);
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Card Image
      </label>

      {value ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-purple-200">
          <img
            src={value}
            alt="Card preview"
            className="w-full h-48 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-lg shadow"
          >
            &times;
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">&#128247;</div>
              <p className="text-sm text-gray-600">
                Drag & drop an image here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, WebP, or GIF (max 5MB)
              </p>
              <p className="text-xs text-purple-600 mt-2">
                Best result: use a 3:4 portrait image (recommended 1200 x 1600 px,
                minimum 750 x 1000 px) to keep the card responsive and avoid
                cropping.
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
