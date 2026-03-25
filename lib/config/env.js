// Typed access to environment variables with validation at startup

export const env = {
  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || '',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'docextract',

  // Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',

  // File storage
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB) || 20,
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'application/pdf,image/jpeg,image/png,image/webp').split(','),

  // App
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  REFERENCE_PREFIX: process.env.REFERENCE_PREFIX || 'DOC',
};

export function validateEnv() {
  const required = ['MONGODB_URI', 'GEMINI_API_KEY'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
