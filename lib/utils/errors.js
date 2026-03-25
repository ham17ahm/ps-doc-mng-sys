export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class GeminiError extends AppError {
  constructor(message, retryable = false) {
    super(`Gemini API error: ${message}`, 502, 'GEMINI_ERROR');
    this.name = 'GeminiError';
    this.retryable = retryable;
  }
}

// Exponential backoff retry wrapper
export async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLast = attempt === maxRetries;
      const isRetryable = error?.status === 429 || error?.status >= 500;

      if (isLast || !isRetryable) throw error;

      const delay = baseDelay * Math.pow(2, attempt); // 1s → 2s → 4s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}

// Build a standardized API error response
export function errorResponse(error) {
  if (error instanceof AppError) {
    return { success: false, error: error.message, code: error.code };
  }
  console.error('Unhandled error:', error);
  return { success: false, error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' };
}
