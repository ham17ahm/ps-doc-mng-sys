'use client';
import { useUpload } from '@/hooks/useUpload';
import FileDropzone from '@/components/upload/FileDropzone';
import UploadQueue from '@/components/upload/UploadQueue';
import ExtractedDataForm from '@/components/upload/ExtractedDataForm';

export default function UploadPage() {
  const {
    files,
    isUploading,
    addFiles,
    removeFile,
    clearAll,
    uploadAll,
    saveDocument,
  } = useUpload();

  // Files that need user review (extracted but not yet saved)
  const forReview = files.filter((f) => f.status === 'extracted' || f.status === 'saving');

  // Only show "Upload More" when every file is done (completed or failed)
  const allDone =
    files.length > 0 &&
    files.every((f) => f.status === 'completed' || f.status === 'failed');

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
        <p className="text-gray-500 mt-1">
          Upload a PDF or image. Gemini will extract the key information for you to review before saving.
        </p>
      </div>

      {/* Drop zone */}
      <FileDropzone onFiles={addFiles} disabled={isUploading} />

      {/* File status list */}
      {files.length > 0 && (
        <UploadQueue
          files={files}
          isUploading={isUploading}
          onRemove={removeFile}
          onUpload={uploadAll}
          onClear={clearAll}
          allDone={allDone}
        />
      )}

      {/* ── Review forms — one per extracted document ── */}
      {forReview.map((fileItem) => (
        <ExtractedDataForm
          key={fileItem.id}
          fileItem={fileItem}
          onSave={(amendedData) => saveDocument(fileItem.id, amendedData)}
        />
      ))}

      {/* Banner (only shown before any files are added) */}
      {files.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white px-8 py-7 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">
            Document Management System
          </p>
          <h2 className="text-xl font-bold text-gray-900 leading-snug">
            Ultimate PS DMS System
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            With capabilities beyond your limit! 😄
          </p>
        </div>
      )}
    </div>
  );
}
