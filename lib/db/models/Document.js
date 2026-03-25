import mongoose, { Schema, model, models } from 'mongoose';

// ── Extracted data sub-schema ──────────────────────────────────────────────
const ExtractedDataSchema = new Schema(
  {
    sender: {
      original:   { type: String },
      english:    { type: String },
      urdu:       { type: String },
      alternates: { type: [String], default: [] },
    },
    origin:               { type: String },
    topic: {
      english:  { type: String },
      urdu:     { type: String },
    },
    remarks:  { type: String },
    language: { type: String, enum: ['en', 'ur'] },
    rawText:              { type: String },
  },
  { _id: false, strict: false }
);

// ── Counter schema ─────────────────────────────────────────────────────────
const CounterSchema = new Schema(
  {
    _id:  { type: String, required: true },
    date: { type: String, required: true },
    seq:  { type: Number, default: 0 },
  },
  { collection: 'counters' }
);

// ── Main document schema ───────────────────────────────────────────────────
const DocumentSchema = new Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    file: {
      originalName: { type: String, required: true },
      storedPath:   { type: String, required: true },
      mimeType:     { type: String, required: true },
      sizeBytes:    { type: Number, required: true },
      pageCount:    { type: Number },
    },

    status: {
      type: String,
      enum: ['queued', 'processing', 'extracted', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    errorMessage: { type: String },

    extractedData: { type: ExtractedDataSchema },
    searchText:    { type: String },
    embedding:     { type: [Number] },
  },
  {
    timestamps: true,
    collection: 'documents',
  }
);

// ── Text index ─────────────────────────────────────────────────────────────
DocumentSchema.index(
  {
    searchText:                        'text',
    'extractedData.topic.english':     'text',
    'extractedData.topic.urdu':        'text',
    'extractedData.sender.original':   'text',
    'extractedData.sender.english':    'text',
    'extractedData.sender.urdu':       'text',
    'extractedData.origin':            'text',
    'extractedData.remarks':           'text',
    'file.originalName':               'text',
  },
  {
    weights: {
      'extractedData.topic.english':   10,
      'extractedData.topic.urdu':      10,
      'extractedData.sender.english':  6,
      'extractedData.sender.urdu':     6,
      'extractedData.sender.original': 6,
      'extractedData.remarks':         5,
      'extractedData.origin':          4,
      searchText:                      3,
      'file.originalName':             1,
    },
    name: 'text_search_index',
    // 'none' disables language-specific stemming/stop-words globally.
    default_language: 'none',
    // Point language_override at a field that never exists in our documents.
    // Without this, MongoDB looks for a field named "language" at ANY nesting
    // level — and finds extractedData.language = "ur", then tries to apply
    // Urdu processing, which Atlas doesn't support.
    language_override: '_textLang',
  }
);

DocumentSchema.index({ status: 1, createdAt: -1 });

export const DocumentModel = models.Document || model('Document', DocumentSchema);
export const CounterModel  = models.Counter  || model('Counter',  CounterSchema);
