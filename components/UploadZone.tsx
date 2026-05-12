'use client';

import { useState, useCallback } from 'react';
import { colors } from '@/design-tokens';

type Props = {
  onUpload: (file: File) => void;
  uploadedFile: File | null;
};

export default function UploadZone({ onUpload, uploadedFile }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      const file = files[0];
      if (file.type === 'application/pdf' ||
          file.type === 'application/vnd.ms-powerpoint' ||
          file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        onUpload(file);
      }
    }
  }, [onUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="relative"
    >
      <input
        type="file"
        id="deck-upload"
        className="hidden"
        accept=".pdf,.ppt,.pptx"
        onChange={handleFileInput}
      />
      <label
        htmlFor="deck-upload"
        className={`block border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
          uploadedFile
            ? 'border-[#A67C2E] bg-[#F8F4EC]'
            : isDragging
            ? 'border-[#A67C2E] bg-[#F8F4EC]'
            : 'border-[#E5DCCA] bg-white hover:border-[#A67C2E] hover:bg-[#F8F4EC]'
        }`}
        style={{
          borderColor: uploadedFile || isDragging ? colors.gold : colors.border,
          backgroundColor: uploadedFile || isDragging ? colors.beigeLight : colors.white,
        }}
      >
        {uploadedFile ? (
          <div className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5 text-[#2D5F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium" style={{ color: colors.text }}>
              {uploadedFile.name}
            </span>
          </div>
        ) : (
          <div>
            <svg className="w-12 h-12 mx-auto mb-4" style={{ color: colors.gold }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium mb-2" style={{ color: colors.text }}>
              Drop your pitch deck here
            </p>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              or click to browse • PDF, PPT, PPTX
            </p>
          </div>
        )}
      </label>
    </div>
  );
}
