/**
 * In-process extraction queue.
 *
 * Flow:
 *  1. Extract via Gemini → may return a single object OR an array
 *     (array means Gemini detected multiple documents on one page/file)
 *  2a. Single result  → save to original document → emit 'extracted'
 *  2b. Multiple results → save item[0] to original document,
 *      create new document records for items 1..N-1 (same file),
 *      emit 'multi_extracted' with all results
 *  3. Embeddings are generated later when the user clicks Save.
 */

import { DocumentModel } from '@/lib/db/models/Document';
import { connectDB } from '@/lib/db/connection';
import { getFileBuffer } from '@/lib/services/file.service';
import { extractDocument } from '@/lib/services/gemini.service';
import { generateReferenceNumber } from '@/lib/services/reference.service';

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
      const raw = await extractDocument(buffer, mimeType, promptName);

      // Step 4 — handle single vs multiple results
      if (Array.isArray(raw) && raw.length > 1) {
        await this._handleMultiple(documentId, raw, promptName);
      } else {
        // Normalise: unwrap single-item array or use object directly
        const extractedData = Array.isArray(raw) ? (raw[0] ?? {}) : raw;
        await DocumentModel.updateOne(
          { _id: documentId },
          { status: 'extracted', extractedData }
        );
        this._emit(documentId, { status: 'extracted', extractedData });
      }

    } catch (err) {
      console.error(`Extraction failed [${documentId}]:`, err.message);
      await DocumentModel.updateOne(
        { _id: documentId },
        { status: 'failed', errorMessage: err.message || 'Unknown error' }
      ).catch(() => {});
      this._emit(documentId, { status: 'failed', error: err.message });
    }
  }

  /**
   * Gemini returned multiple extracted objects for one file.
   * Save item[0] to the original document; create new records for the rest.
   * Emit a 'multi_extracted' event so the frontend can show one form per result.
   */
  async _handleMultiple(documentId, items, promptName) {
    const original = await DocumentModel.findById(documentId).lean();
    const results = [];

    for (let i = 0; i < items.length; i++) {
      const extractedData = items[i];

      if (i === 0) {
        // Update the original document
        await DocumentModel.updateOne(
          { _id: documentId },
          { status: 'extracted', extractedData }
        );
        results.push({
          id: documentId,
          referenceNumber: original.referenceNumber,
          extractedData,
        });
      } else {
        // Create a sibling document record for each additional item
        const referenceNumber = await generateReferenceNumber();
        const sibling = await DocumentModel.create({
          referenceNumber,
          promptName,
          file: original.file,
          status: 'extracted',
          extractedData,
        });
        results.push({
          id: sibling._id.toString(),
          referenceNumber,
          extractedData,
        });
      }
    }

    this._emit(documentId, { status: 'multi_extracted', results });
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
