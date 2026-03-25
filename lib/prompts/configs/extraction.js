/**
 * Extraction Prompt Config
 *
 * This file defines HOW Gemini should extract data from a document.
 * The schema (what fields to extract) comes from lib/prompts/schema.js
 * and is shared across all prompts automatically.
 *
 * To create a new prompt: copy this file, change the instructions, done.
 * See PROMPTS.md in the project root for a beginner-friendly guide.
 */

const extraction = {
  // ─── Identity ────────────────────────────────────────────────────────
  name: 'extraction',
  description: 'Extract structured data from correspondence documents',

  // ─── Role ────────────────────────────────────────────────────────────
  // Tell the AI who it is and what kind of documents it will handle.
  role: `You are a document information extraction system specializing in correspondence and official documents, which may be written in English, Urdu, or both languages.`,

  // ─── Task ────────────────────────────────────────────────────────────
  // A one-liner telling the AI what to do with the document.
  task: `Extract specific information from the attached document and return it as a JSON object.`,

  // ─── Rules ───────────────────────────────────────────────────────────
  // Each rule is a simple string. They will be numbered automatically.
  // To add a rule:  just add a new string to this array.
  // To remove one:  delete the string. The numbering adjusts itself.
  rules: [
    'Output ONLY valid JSON. No extra text, no markdown code fences, no explanation.',

    'Preserve original script — do NOT convert Urdu to Roman Urdu unless specifically asked. Urdu text must remain in Urdu script (نستعلیق). English text stays in English.',

    'For the sender name: provide it in the original script AND translated/transliterated into both English and Urdu, even if one requires transliteration.',

    'For the topic: write a single crisp sentence summarizing the core subject of the document — in BOTH English and Urdu.',

    'For origin: extract the full address or location of the sender. This is often found at the top or bottom of the correspondence. Take everything present — do not abbreviate.',

    'For any field you cannot find, use null.',

    'For sender.alternates: think about how the sender\'s name might be spelled differently in English due to transliteration variation (e.g., Humayun/Hamayun, Ramadhan/Ramadan, Zia-ul-Haq/Ziaul Haq). Include only genuinely plausible alternate spellings — do not invent random variants.',
  ],

  // ─── Closing ─────────────────────────────────────────────────────────
  // The final instruction sent to the AI after the schema.
  closing: 'Analyze the attached document and return ONLY the JSON object.',

  // ─── Schema ──────────────────────────────────────────────────────────
  // Not needed here — the shared default schema from lib/prompts/schema.js
  // is used automatically. Only add a schema property if this prompt needs
  // different fields than the default.
};

export default extraction;
