'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';

/**
 * Shows the Gemini-extracted fields in editable text boxes.
 * The user can correct any value before clicking Save.
 */
export default function ExtractedDataForm({ fileItem, onSave }) {
  const initial = fileItem.formData || {};

  const [form, setForm] = useState({
    sender: {
      original: initial.sender?.original || '',
      english:  initial.sender?.english  || '',
      urdu:     initial.sender?.urdu     || '',
    },
    origin:     initial.origin     || '',
    topic: {
      english:  initial.topic?.english || '',
      urdu:     initial.topic?.urdu    || '',
    },
    remarks: initial.remarks || '',
    language:   initial.language   || 'en',
  });

  const isSaving = fileItem.status === 'saving';

  function setNested(section, key, value) {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  }

  function setFlat(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onSave({
      ...form,
      sender: {
        ...form.sender,
        alternates: initial.sender?.alternates || [],
      },
    });
  }

  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Review Extracted Data</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Check the fields below and correct anything before saving.
          </p>
        </div>
        {fileItem.referenceNumber && (
          <span className="font-mono text-xs text-gray-400">{fileItem.referenceNumber}</span>
        )}
      </div>

      {/* Error (if save failed) */}
      {fileItem.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {fileItem.error}
        </p>
      )}

      {/* ── Sender ── */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Sender
        </legend>
        <Field
          label="Original (as in document)"
          value={form.sender.original}
          onChange={(v) => setNested('sender', 'original', v)}
          dir={form.language === 'ur' ? 'rtl' : 'ltr'}
          disabled={isSaving}
        />
        <Field
          label="English"
          value={form.sender.english}
          onChange={(v) => setNested('sender', 'english', v)}
          dir="ltr"
          disabled={isSaving}
        />
        <Field
          label="Urdu"
          value={form.sender.urdu}
          onChange={(v) => setNested('sender', 'urdu', v)}
          dir="rtl"
          placeholder="اردو نام"
          disabled={isSaving}
        />
      </fieldset>

      {/* ── Origin ── */}
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Origin / Address
        </legend>
        <textarea
          value={form.origin}
          onChange={(e) => setFlat('origin', e.target.value)}
          rows={3}
          disabled={isSaving}
          dir={form.language === 'ur' ? 'rtl' : 'ltr'}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
          placeholder="Full address or location…"
        />
      </fieldset>

      {/* ── Topic ── */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Topic
        </legend>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">English</label>
          <textarea
            value={form.topic.english}
            onChange={(e) => setNested('topic', 'english', e.target.value)}
            rows={2}
            disabled={isSaving}
            dir="ltr"
            placeholder="One-line summary of the matter in English…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Urdu</label>
          <textarea
            value={form.topic.urdu}
            onChange={(e) => setNested('topic', 'urdu', e.target.value)}
            rows={2}
            disabled={isSaving}
            dir="rtl"
            placeholder="اردو میں خلاصہ…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
          />
        </div>
      </fieldset>

      {/* ── Remarks ── */}
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Remarks <span className="normal-case font-normal text-gray-400">(assignment, notes, or any other annotation — fill in manually if needed)</span>
        </legend>
        <textarea
          value={form.remarks}
          onChange={(e) => setFlat('remarks', e.target.value)}
          rows={3}
          disabled={isSaving}
          dir={form.language === 'ur' ? 'rtl' : 'ltr'}
          placeholder="e.g. Assigned to Hamid Ali, or: Please expedite"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
        />
      </fieldset>

      {/* Save button */}
      <div className="flex justify-end pt-1">
        <Button onClick={handleSave} loading={isSaving} disabled={isSaving}>
          Save to Database
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir = 'ltr', placeholder = '', disabled }) {
  return (
    <div>
      {label && (
        <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    </div>
  );
}
