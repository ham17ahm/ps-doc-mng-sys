import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { validateFile, detectMimeType } from '@/lib/utils/validators';
import { sanitizeFilename, getExtension } from '@/lib/utils/formatters';
import { env } from '@/lib/config/env';

/**
 * Validates a file buffer, stores it to disk, and returns metadata.
 * All file I/O goes through this service so storage can be swapped to S3/GCS later.
 */
export async function validateAndStore(buffer, originalName, reportedMimeType) {
  // 1. Validate — throws ValidationError on failure
  const mimeType = validateFile(buffer, originalName, reportedMimeType);

  // 2. Build storage path: uploads/YYYY-MM/uuid.ext
  const now = new Date();
  const dateDir = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const ext = getExtension(sanitizeFilename(originalName)) || '.bin';
  const uuid = crypto.randomUUID();
  const relPath = path.join('uploads', dateDir, `${uuid}${ext}`);
  const absPath = path.resolve(process.cwd(), relPath);

  // 3. Ensure directory exists
  await fs.mkdir(path.dirname(absPath), { recursive: true });

  // 4. Write file
  await fs.writeFile(absPath, buffer);

  // 5. Get PDF page count if applicable
  let pageCount;
  if (mimeType === 'application/pdf') {
    pageCount = await getPdfPageCount(buffer);
  }

  return {
    originalName: sanitizeFilename(originalName),
    storedPath: relPath.replace(/\\/g, '/'), // Always use forward slashes
    mimeType,
    sizeBytes: buffer.length,
    pageCount,
  };
}

export async function getFileBuffer(storedPath) {
  const absPath = path.resolve(process.cwd(), storedPath);
  return fs.readFile(absPath);
}

export async function deleteFile(storedPath) {
  const absPath = path.resolve(process.cwd(), storedPath);
  await fs.unlink(absPath).catch(() => {}); // Ignore if already deleted
}

// Count pages in a PDF by scanning for /Page objects in the buffer
async function getPdfPageCount(buffer) {
  try {
    const text = buffer.toString('latin1');
    const matches = text.match(/\/Type\s*\/Page[^s]/g);
    return matches ? matches.length : undefined;
  } catch {
    return undefined;
  }
}
