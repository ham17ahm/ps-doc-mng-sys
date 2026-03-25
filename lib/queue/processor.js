/**
 * In-process extraction queue.
 *
 * Updated flow:
 *  1. Extract via Gemini → save extractedData to DB → status = "extracted"
 *  2. Emit SSE event with extracted data so the client can populate
 *     the review form.
 *  3. Embeddings are NOT generated here. They are generated later when
 *     the user reviews the data and clicks Save (PATCH /api/documents/[id]).
 */

import { DocumentModel } from '@/lib/db/models/Document';
import { connectDB } from '@/lib/db/connection';
import { getFileBuffer } from '@/lib/services/file.service';
import { extractDocument } from '@/lib/services/gemini.service';

const MAX_CONCURRENCY = 3;

class ExtractionQueue {
  constructor() {
    this.queue = [];
    this.processing = 0;
    this.statusEmitters = new Map(); // Map<documentId, (payload) => void>
  }

  enqueue(job) {
    this.queue.push(job);
    this._processNext();
  }

  onStatus(documentId, callback) {
    this.statusEmitters.set(documentId, callback);
  }

  offStatus(documentId) {
    this.statusEmitters.delete(documentId);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  _processNext() {
    if (this.processing >= MAX_CONCURRENCY || this.queue.length === 0) return;
    this.processing++;
    const job = this.queue.shift();
    this._runJob(job).finally(() => {
      this.processing--;
      this._processNext();
    });
  }

  async _runJob({ documentId, storedPath, mimeType, promptName = 'extraction' }) {
    try {
      await connectDB();

      // Step 1 — mark as processing
      this._emit(documentId, { status: 'processing', step: 'Reading file…' });
      await DocumentModel.updateOne({ _id: documentId }, { status: 'processing' });

      // Step 2 — read file from disk
      const buffer = await getFileBuffer(storedPath);

      // Step 3 — extract with Gemini
      this._emit(documentId, { status: 'processing', step: 'Extracting data with Gemini…' });
      const extractedData = await extractDocument(buffer, mimeType, promptName);

      // Step 4 — save extracted data to DB (status: extracted, no embeddings yet)
      await DocumentModel.updateOne(
        { _id: documentId },
        { status: 'extracted', extractedData }
      );

      // Step 5 — notify client with extracted data
      this._emit(documentId, { status: 'extracted', extractedData });

    } catch (err) {
      console.error(`Extraction failed [${documentId}]:`, err.message);
      await DocumentModel.updateOne(
        { _id: documentId },
        { status: 'failed', errorMessage: err.message || 'Unknown error' }
      ).catch(() => {});
      this._emit(documentId, { status: 'failed', error: err.message });
    }
  }

  _emit(documentId, payload) {
    this.statusEmitters.get(documentId)?.(payload);
  }
}

// Keep a single instance across module re-evaluations in Next.js dev mode
// (same pattern as the MongoDB connection singleton)
if (!global._extractionQueue) {
  global._extractionQueue = new ExtractionQueue();
}
export const extractionQueue = global._extractionQueue;
