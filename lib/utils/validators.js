import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB, MAX_FILES_PER_UPLOAD } from '@/lib/config/constants';
import { ValidationError } from '@/lib/utils/errors';

// Detect MIME type from magic bytes (first few bytes of file)
export function detectMimeType(buffer) {
  const bytes = buffer.slice(0, 8);

  // PDF: %PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf';
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }
  // WebP: RIFF....WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    // Check bytes 8-11 for WEBP
    const webpCheck = buffer.slice(8, 12);
    if (
      webpCheck[0] === 0x57 && webpCheck[1] === 0x45 &&
      webpCheck[2] === 0x42 && webpCheck[3] === 0x50
    ) {
      return 'image/webp';
    }
  }

  return null; // Unknown type
}

// Validate a single file — throws ValidationError if invalid
export function validateFile(buffer, originalName, reportedMimeType) {
  // 1. Check size
  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (buffer.length > maxBytes) {
    throw new ValidationError(`"${originalName}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit`);
  }

  // 2. Detect true MIME type from magic bytes
  const detectedType = detectMimeType(buffer);
  if (!detectedType) {
    throw new ValidationError(
      `"${originalName}" has an unrecognized file format. Allowed: PDF, JPG, PNG, WEBP`
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(detectedType)) {
    throw new ValidationError(
      `"${originalName}" is type "${detectedType}" which is not allowed. Allowed: PDF, JPG, PNG, WEBP`
    );
  }

  return detectedType; // Return the verified type
}

// Validate batch of files
export function validateFileBatch(files) {
  if (!files || files.length === 0) {
    throw new ValidationError('No files provided');
  }
  if (files.length > MAX_FILES_PER_UPLOAD) {
    throw new ValidationError(`Maximum ${MAX_FILES_PER_UPLOAD} files per upload`);
  }
}

// Sanitize a search query — prevent NoSQL injection
export function sanitizeQuery(query) {
  if (typeof query !== 'string') return '';
  // Strip MongoDB operator chars and limit length
  return query
    .replace(/[${}]/g, '')
    .substring(0, 500)
    .trim();
}
