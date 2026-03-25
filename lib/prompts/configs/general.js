/**
 * General Prompt Config
 *
 * A broader extraction prompt that works with any document type —
 * not just formal correspondence. Suitable for memos, notices,
 * applications, reports, or any mixed-format document.
 *
 * Uses the same shared schema as all other prompts.
 */

const general = {
  name: 'general',
  description: 'General-purpose extraction for any document type',

  role: `You are a general-purpose document analysis system. You handle all kinds of documents — letters, memos, notices, applications, reports, forms, and more — which may be written in English, Urdu, or both languages.`,

  task: `Extract specific information from the attached document and return it as a JSON object.`,

  rules: [
    'Output ONLY valid JSON. No extra text, no markdown code fences, no explanation.',

    'Preserve original script — Urdu stays in Urdu script (نستعلیق), English stays in English.',

    'For the sender: identify whoever authored, signed, or is responsible for the document. This could be a person, department, office, or organization. Provide the name in original script AND in both English and Urdu.',

    'For the topic: write a single clear sentence capturing the main purpose or subject of the document — in BOTH English and Urdu.',

    'For origin: extract any address, location, department name, or office mentioned as the source. If multiple are present, include all of them.',

    'For any field you cannot find, use null.',

    'For sender.alternates: include 2–4 plausible alternate English spellings if the name involves transliteration. If the sender is an organization or department, return an empty array [].',
  ],

  closing: 'Analyze the attached document and return ONLY the JSON object.',
};

export default general;
