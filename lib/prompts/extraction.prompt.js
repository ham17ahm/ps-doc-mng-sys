/**
 * Extraction schema — the exact JSON structure Gemini must return.
 */
export const EXTRACTION_SCHEMA = {
  sender: {
    original:   'string — The sender\'s name exactly as written in the document, in the original language and script',
    english:    'string — The sender\'s name in English (transliterate if Urdu, keep as-is if already English)',
    urdu:       'string — The sender\'s name in Urdu script (transliterate if English, keep as-is if already Urdu)',
    alternates: 'string[] — A list of common alternative English spellings or transliterations of the sender\'s name. For example, "Humayun" might also be spelled "Hamayun", "Homayun", "Humaiun". Include 2–4 variants. If no meaningful alternates exist, return an empty array [].',
  },
  origin: 'string — The sender\'s full address or location as written in the document. Extract whatever location information is present — full address, city, district, or any other origin detail. Return verbatim from the document.',
  topic: {
    english: 'string — A single concise sentence (the crux of the matter) describing what this document is about, written in English',
    urdu:    'string — The same single concise sentence describing what this document is about, written in Urdu script',
  },
  language: '"en" | "ur" — The dominant language of the document. Pick whichever language makes up the majority of the text.',
  rawText:              'string — The complete plain-text content of the document, preserving original language and script',
};

/**
 * Builds the Gemini extraction prompt with the schema embedded.
 */
export function buildExtractionPrompt() {
  return `You are a document information extraction system specializing in correspondence and official documents, which may be written in English, Urdu, or both languages.

Your task is to extract specific information from the attached document and return it as a JSON object.

RULES:
1. Output ONLY valid JSON. No extra text, no markdown code fences, no explanation.
2. Preserve original script — do NOT convert Urdu to Roman Urdu unless specifically asked.
   Urdu text must remain in Urdu script (نستعلیق). English text stays in English.
3. For the sender name: provide it in the original script AND translated/transliterated
   into both English and Urdu, even if one requires transliteration.
4. For the topic: write a single crisp sentence summarizing the core subject of the
   document — in BOTH English and Urdu.
5. For origin: extract the full address or location of the sender. This is often found
   at the top or bottom of the correspondence. Take everything present — do not abbreviate.
6. For any field you cannot find, use null.
7. The rawText field should contain the complete text of the document as-is.
8. For sender.alternates: think about how the sender's name might be spelled differently
   in English due to transliteration variation (e.g., Humayun/Hamayun, Ramadhan/Ramadan,
   Zia-ul-Haq/Ziaul Haq). Include only genuinely plausible alternate spellings — do not
   invent random variants.

EXTRACTION SCHEMA:
${JSON.stringify(EXTRACTION_SCHEMA, null, 2)}

Analyze the attached document and return ONLY the JSON object.`;
}
