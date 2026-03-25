/**
 * Builds a single searchable string from extracted data.
 * Used for both MongoDB text index and vector embedding.
 * All language variants are included so queries in either language hit results.
 */
export function buildSearchText(data) {
  if (!data) return '';
  const parts = [];

  // Sender — all three variants + alternate spellings for cross-language search
  if (data.sender?.original)                    parts.push(data.sender.original);
  if (data.sender?.english)                     parts.push(data.sender.english);
  if (data.sender?.urdu)                        parts.push(data.sender.urdu);
  if (data.sender?.alternates?.length)          parts.push(data.sender.alternates.join(' '));

  // Origin / address
  if (data.origin) parts.push(data.origin);

  // Topic — both languages (critical for semantic search)
  if (data.topic?.english) parts.push(data.topic.english);
  if (data.topic?.urdu)    parts.push(data.topic.urdu);

  // Remarks (manually entered by user)
  if (data.remarks) parts.push(data.remarks);

  // Raw document text (first 5000 chars for embedding quality)
  if (data.rawText) parts.push(data.rawText.substring(0, 5000));

  return parts.join(' | ');
}

// Format date as YYYYMMDD string
export function formatDateCompact(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

// Format bytes to human-readable size
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Format a date for display
export function formatDisplayDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Truncate a string with ellipsis
export function truncate(str, maxLength = 200) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength).trimEnd() + '…';
}

// Sanitize a filename — strip path traversal and special characters
export function sanitizeFilename(name) {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\.{2,}/g, '.')
    .trim();
}

// Get file extension including the dot, e.g., ".pdf"
export function getExtension(filename) {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.substring(idx).toLowerCase() : '';
}
