import { CounterModel } from '@/lib/db/models/Document';
import { formatDateCompact } from '@/lib/utils/formatters';
import { env } from '@/lib/config/env';

/**
 * Generates a unique, human-readable reference number.
 * Format: DOC-20260324-00001
 * Uses an atomic MongoDB counter — safe under concurrent requests.
 */
export async function generateReferenceNumber() {
  const today = formatDateCompact(new Date()); // e.g., "20260324"
  const prefix = env.REFERENCE_PREFIX || 'DOC';

  const counter = await CounterModel.findOneAndUpdate(
    { _id: 'doc_ref', date: today },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  const seq = String(counter.seq).padStart(5, '0');
  return `${prefix}-${today}-${seq}`;
}
