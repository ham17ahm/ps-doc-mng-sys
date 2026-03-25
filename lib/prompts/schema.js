/**
 * Default Extraction Schema (Single Source of Truth)
 *
 * This defines the JSON structure that Gemini must return.
 * All prompt configs use this schema by default. If a prompt config
 * does not include its own schema, the builder uses this one.
 *
 * To change what fields are extracted, edit this file.
 * The MongoDB model uses strict: false, so any shape is accepted.
 */

export const defaultSchema = {
  sender: {
    original:   'The sender\'s name exactly as written in the document, in the original language and script',
    english:    'The sender\'s name in English (transliterate if Urdu, keep as-is if already English)',
    urdu:       'The sender\'s name in Urdu script (transliterate if English, keep as-is if already Urdu)',
    alternates: 'string[] — A list of 2–4 common alternative English spellings or transliterations of the sender\'s name. For example, "Humayun" might also be spelled "Hamayun", "Homayun", "Humaiun". If no meaningful alternates exist, return an empty array [].',
  },
  origin: 'The sender\'s full address or location as written in the document. Extract whatever location information is present — full address, city, district, or any other origin detail. Return verbatim from the document.',
  topic: {
    english: 'A single concise sentence (the crux of the matter) describing what this document is about, written in English',
    urdu:    'The same single concise sentence describing what this document is about, written in Urdu script',
  },
  language: '"en" | "ur" — The dominant language of the document. Pick whichever language makes up the majority of the text.',
};
