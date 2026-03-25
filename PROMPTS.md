# Prompt System Guide

This guide explains how prompts work in DocExtract and how to add or edit them.
No deep technical knowledge is needed — if you can edit a text file, you can work with prompts.

---

## How It Works (The Big Picture)

When a user uploads a document, they choose a **prompt** from a dropdown (defaulting to "extraction"). The prompt tells Gemini what to do with the document — how to extract information, what rules to follow, etc.

All prompts share the same **schema** (the fields that get extracted: sender, origin, topic, language). The schema is defined once in `lib/prompts/schema.js` and used automatically by every prompt.

The system has three parts:

| Part | Location | What it does |
|------|----------|-------------|
| **Schema** | `lib/prompts/schema.js` | The fields Gemini extracts (shared by all prompts). **Edit this to change what fields are extracted.** |
| **Config files** | `lib/prompts/configs/*.js` | The instructions — role, rules, closing. **Edit these to change how extraction works.** |
| **Builder** | `lib/prompts/builder.js` | Assembles a config + schema into a prompt string. You don't need to touch this. |

The system **auto-discovers** every `.js` file in the `configs/` folder. Drop a file in, and it appears in the dropdown.

> **Rule of thumb:** Edit config files to change instructions. Edit `schema.js` to change fields. Leave everything else alone.

---

## Anatomy of a Prompt Config

Open `lib/prompts/configs/extraction.js` — here's what each section does:

```
name          →  A short identifier (appears in the dropdown and is stored on each document)
description   →  Shown next to the name in the dropdown

role          →  Tells the AI "who it is" (e.g., a document extraction system)
task          →  A one-line instruction of what to do (e.g., "extract information")

rules         →  A list of specific instructions the AI must follow
                  Each rule is a plain string — they get numbered automatically

closing       →  The final instruction (e.g., "return ONLY the JSON object")
```

The **schema** is NOT in the config — it comes from `lib/prompts/schema.js` automatically. You only add a `schema` property to a config if that specific prompt needs different fields (advanced use case).

---

## Common Tasks

### Edit an Existing Rule

1. Open `lib/prompts/configs/extraction.js`
2. Find the `rules` array
3. Edit the text of the rule you want to change
4. Save — done

### Add a New Rule

Add a new string to the `rules` array:

```js
rules: [
  'Existing rule one...',
  'Existing rule two...',
  'Your new rule here.',   // ← just add it
],
```

Rules are numbered automatically.

### Change What Fields Are Extracted

Edit `lib/prompts/schema.js`. This is the single source of truth for all field definitions.

**Important:** When you add or remove a schema field, also update:

- **MongoDB model** (`lib/db/models/Document.js`) — if you want explicit validation or search indexing
- **Review form** (`components/upload/ExtractedDataForm.js`) — so users can see/edit the field
- **Display component** (`components/documents/ExtractedDataView.js`) — so saved documents show the field
- **Edit page** (`app/documents/[id]/edit/page.js`) — so the field appears in the edit form
- **Search text builder** (`lib/utils/formatters.js` → `buildSearchText`) — if you want the field searchable

Note: MongoDB has `strict: false`, so new fields will save without breaking anything. The above steps just ensure they appear in the UI and search.

---

## Creating a New Prompt (One Step)

To create a new prompt (e.g., for legal documents, classified mail, etc.):

1. Copy `lib/prompts/configs/extraction.js` and rename it (e.g., `legal.js`)
2. Change the content — name, description, role, rules, closing
3. Save the file

That's it. The system auto-discovers it and it appears in the dropdown.

**Example:**

```js
const legal = {
  name: 'legal',
  description: 'Extract data from legal and court documents',

  role: `You are a legal document analysis system specializing in court orders, petitions, and legal correspondence in English and Urdu.`,

  task: `Extract specific information from the attached legal document and return it as a JSON object.`,

  rules: [
    'Output ONLY valid JSON. No extra text, no markdown code fences, no explanation.',
    'Preserve original script — Urdu stays in Urdu, English stays in English.',
    'For the sender: identify the petitioner, applicant, or originating party.',
    'For origin: extract the court name, bench, or jurisdiction.',
    'For the topic: summarize the legal matter in one sentence — in both English and Urdu.',
    'For any field you cannot find, use null.',
    'For sender.alternates: include plausible alternate English spellings of names.',
  ],

  closing: 'Analyze the attached document and return ONLY the JSON object.',
};

export default legal;
```

The schema (sender, origin, topic, language) is used automatically — no need to include it.

---

## How the Dropdown Works

- **Upload page:** A dropdown appears when there are multiple prompts. The user picks one before uploading. It defaults to "extraction".
- **Edit page:** A "Re-extract" panel lets the user re-send the document to Gemini with a different prompt. This overwrites the previous extraction.
- **Metadata panel:** Shows which prompt was used on each document.

---

## Re-extracting a Document

On the edit page (`/documents/[id]/edit`), there's a panel at the top:

1. Select a prompt from the dropdown
2. Click "Re-extract"
3. The document is re-sent to Gemini with the new prompt
4. You're redirected to the detail page to watch progress

This is useful when the default prompt didn't extract well and you want to try a different set of instructions.

---

## File Reference

```
lib/prompts/
  schema.js             ← shared field definitions (single source of truth)
  configs/
    extraction.js       ← default prompt config
    (your-new-one.js)   ← just drop a file here — auto-discovered
  builder.js            ← assembles config + schema into prompt string (don't edit)
  index.js              ← auto-discovery logic (don't edit)
```
