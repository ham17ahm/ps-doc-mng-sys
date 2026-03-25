import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';
import { env } from '@/lib/config/env';
import { GeminiError, withRetry } from '@/lib/utils/errors';
import { buildExtractionPrompt } from '@/lib/prompts/extraction.prompt';

let _client = null;
let _genAIClient = null;

// Set to false the first time embedContent returns 404 (model not available
// on this API key). All subsequent calls return null immediately so the
// console is not flooded with repeated 404 errors.
let _embeddingAvailable = true;

function getClient() {
  if (!_client) {
    if (!env.GEMINI_API_KEY) throw new GeminiError('GEMINI_API_KEY is not set');
    _client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return _client;
}

function getGenAIClient() {
  if (!_genAIClient) {
    if (!env.GEMINI_API_KEY) throw new GeminiError('GEMINI_API_KEY is not set');
    _genAIClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return _genAIClient;
}

/**
 * Extract structured data from a document file (PDF or image).
 *
 * gemini-2.5-flash is a "thinking" model — its response candidates contain
 * parts where part.thought === true (the internal reasoning trace).
 * We must filter those out and only join the real output parts,
 * otherwise result.response.text() can throw "language override unsupported".
 */
export async function extractDocument(buffer, mimeType) {
  return withRetry(async () => {
    const client = getClient();
    const generativeModel = client.getGenerativeModel({
      model: env.GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const result = await generativeModel.generateContent([
      { text: buildExtractionPrompt() },
      { inlineData: { mimeType, data: buffer.toString('base64') } },
    ]);

    // ── Extract text safely, skipping thinking parts ──────────────────────
    // For thinking models (gemini-2.5-*) each candidate has parts where
    // part.thought === true for reasoning tokens and false/undefined for output.
    // We must filter those out and only join the real output parts,
    // otherwise result.response.text() can throw for thinking-only responses.
    let responseText;
    try {
      const candidate = result.response.candidates?.[0];
      if (candidate?.content?.parts) {
        responseText = candidate.content.parts
          .filter((p) => !p.thought)          // drop thinking tokens
          .map((p) => p.text ?? '')
          .join('');
      } else {
        // Fallback for non-thinking models
        responseText = result.response.text();
      }
    } catch (e) {
      throw new GeminiError(`Could not read Gemini response: ${e.message}`, true);
    }

    if (!responseText?.trim()) {
      throw new GeminiError('Empty response from Gemini', true);
    }

    // Strip accidental markdown fences (``` json ... ```)
    const cleaned = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new GeminiError('Response was not valid JSON', true);
    }

    return parsed;
  }, 3, 1000);
}

/**
 * Generate a 768-dimensional embedding vector.
 * Returns null if the embedding model is not available on this API key,
 * in which case the app falls back to text-only search transparently.
 */
export async function generateEmbedding(text) {
  if (!_embeddingAvailable) return null;

  try {
    return await withRetry(async () => {
      const ai = getGenAIClient();
      const result = await ai.models.embedContent({
        model: env.GEMINI_EMBEDDING_MODEL,
        contents: text.substring(0, 8000),
        config: { outputDimensionality: 768, taskType: 'RETRIEVAL_DOCUMENT' },
      });
      return result.embeddings[0].values; // float[768]
    }, 3, 1000);
  } catch (err) {
    // 404 means the model isn't available on this API key — disable permanently
    if (err.message?.includes('404') || err.message?.includes('not found')) {
      _embeddingAvailable = false;
      console.warn(
        `[DocExtract] Embedding model "${env.GEMINI_EMBEDDING_MODEL}" is not available on this API key.\n` +
        `            Vector search is disabled — text search will be used instead.\n` +
        `            To enable semantic search, update GEMINI_EMBEDDING_MODEL in .env.local.`
      );
      return null;
    }
    throw err; // re-throw transient errors so withRetry can handle them
  }
}

/** Useful for callers that want to skip the embedding call entirely. */
export function isEmbeddingAvailable() {
  return _embeddingAvailable;
}
