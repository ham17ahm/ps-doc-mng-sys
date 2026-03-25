'use client';
import { useState, useCallback } from 'react';

const initialFileState = (file) => ({
  file,
  id: Math.random().toString(36).slice(2),
  progress: 0,
  status: 'pending', // pending | uploading | queued | processing | extracted | saving | completed | failed
  step: '',
  referenceNumber: null,
  documentId: null,
  formData: null,   // populated when extraction completes (for review form)
  error: null,
});

export function useUpload() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [promptName, setPromptName] = useState('extraction');

  const addFiles = useCallback((newFiles) => {
    setFiles((prev) => [...prev, ...Array.from(newFiles).map(initialFileState)]);
  }, []);

  const removeFile = useCallback((id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const updateFile = useCallback((id, patch) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  // Upload all pending files as one batch request
  const uploadAll = useCallback(async () => {
    const pending = files.filter((f) => f.status === 'pending');
    if (!pending.length) return;

    setIsUploading(true);
    pending.forEach((f) => updateFile(f.id, { status: 'uploading', progress: 30 }));

    const formData = new FormData();
    pending.forEach((f) => formData.append('files', f.file));
    formData.append('promptName', promptName);

    try {
      const res  = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');

      data.documents.forEach((doc, i) => {
        const localId = pending[i]?.id;
        if (!localId) return;
        updateFile(localId, {
          status:          'queued',
          progress:        60,
          referenceNumber: doc.referenceNumber,
          documentId:      doc.id,
        });
        // Start SSE listener for this document
        listenForStatus(doc.id, localId, updateFile, setFiles);
      });

    } catch (err) {
      pending.forEach((f) => updateFile(f.id, { status: 'failed', error: err.message }));
    } finally {
      setIsUploading(false);
    }
  }, [files, updateFile, promptName]);

  /**
   * Called when the user clicks Save on the review form.
   * Sends the (possibly amended) data to PATCH /api/documents/[id],
   * which generates embeddings and marks the doc as completed.
   */
  const saveDocument = useCallback(async (fileId, amendedData) => {
    const fileItem = files.find((f) => f.id === fileId);
    if (!fileItem) return;

    updateFile(fileId, { status: 'saving', error: null });

    try {
      const res = await fetch(`/api/documents/${fileItem.documentId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ extractedData: amendedData }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      updateFile(fileId, { status: 'completed', progress: 100 });
    } catch (err) {
      // Go back to "extracted" so the user can try again
      updateFile(fileId, { status: 'extracted', error: err.message });
    }
  }, [files, updateFile]);

  return {
    files,
    isUploading,
    promptName,
    setPromptName,
    addFiles,
    removeFile,
    clearAll,
    uploadAll,
    saveDocument,
  };
}

// ── SSE listener ────────────────────────────────────────────────────────────
function listenForStatus(documentId, localId, updateFile, setFiles) {
  const es = new EventSource(`/api/documents/${documentId}/status`);

  es.addEventListener('status', (e) => {
    const data = JSON.parse(e.data);

    switch (data.status) {
      case 'processing':
        updateFile(localId, { status: 'processing', step: data.step || 'Processing…', progress: 75 });
        break;

      case 'extracted':
        // Single result — store the data so the review form can use it
        updateFile(localId, {
          status:   'extracted',
          step:     '',
          progress: 100,
          formData: data.extractedData || {},
        });
        es.close();
        break;

      case 'multi_extracted':
        // Gemini detected multiple documents in one file.
        // Replace the single file item with one item per result.
        setFiles((prev) => {
          const idx = prev.findIndex((f) => f.id === localId);
          if (idx === -1) return prev;
          const original = prev[idx];
          const expanded = data.results.map((result, i) => ({
            ...original,
            id:              i === 0 ? localId : Math.random().toString(36).slice(2),
            status:          'extracted',
            step:            '',
            progress:        100,
            documentId:      result.id,
            referenceNumber: result.referenceNumber,
            formData:        result.extractedData || {},
          }));
          return [...prev.slice(0, idx), ...expanded, ...prev.slice(idx + 1)];
        });
        es.close();
        break;

      case 'completed':
        updateFile(localId, { status: 'completed', step: '', progress: 100 });
        es.close();
        break;

      case 'failed':
        updateFile(localId, { status: 'failed', error: data.error || 'Extraction failed', progress: 0 });
        es.close();
        break;
    }
  });

  es.onerror = () => es.close();
}
