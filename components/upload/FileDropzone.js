'use client';
import { useCallback, useState } from 'react';

export default function FileDropzone({ onFiles, disabled }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length) onFiles(dropped);
    },
    [disabled, onFiles]
  );

  const handleChange = (e) => {
    if (e.target.files?.length) onFiles(Array.from(e.target.files));
    e.target.value = ''; // Reset so same file can be re-added
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors
        ${isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div>
        <p className="font-medium text-gray-700">
          Drag & drop files here, or{' '}
          <label className={`text-blue-600 underline ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`}>
            browse
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="sr-only"
              onChange={handleChange}
              disabled={disabled}
            />
          </label>
        </p>
        <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG, WEBP — up to 20 MB each, 10 files max</p>
      </div>
    </div>
  );
}
