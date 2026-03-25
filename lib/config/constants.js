export const MAX_FILES_PER_UPLOAD = 10;
export const MAX_FILE_SIZE_MB = 20;
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export const DOCUMENT_STATUSES = {
  QUEUED:     'queued',
  PROCESSING: 'processing',
  EXTRACTED:  'extracted',
  COMPLETED:  'completed',
  FAILED:     'failed',
};

export const SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  DATE_DESC: 'date_desc',
  DATE_ASC: 'date_asc',
};

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// RRF constant — higher value reduces rank difference impact
export const RRF_K = 60;

// Gemini embedding dimensions
export const EMBEDDING_DIMS = 768;

// Rate limits (requests per minute per IP)
export const UPLOAD_RATE_LIMIT = 10;
export const SEARCH_RATE_LIMIT = 30;
