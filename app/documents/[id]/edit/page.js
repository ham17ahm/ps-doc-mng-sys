'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function EditDocumentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [doc, setDoc] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) { setError('Document not found.'); return; }
        const d = data.document;
        setDoc(d);
        setForm({
          sender: {
            original:   d.extractedData?.sender?.original   || '',
            english:    d.extractedData?.sender?.english    || '',
            urdu:       d.extractedData?.sender?.urdu       || '',
            alternates: d.extractedData?.sender?.alternates || [],
          },
          origin:   d.extractedData?.origin         || '',
          topic: {
            english: d.extractedData?.topic?.english || '',
            urdu:    d.extractedData?.topic?.urdu    || '',
          },
          remarks:  d.extractedData?.remarks  || '',
          language: d.extractedData?.language || 'en',
        });
      })
      .catch(() => setError('Failed to load document.'));
  }, [id]);

  function setNested(section, key, value) {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  function setFlat(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedData: form }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Save failed');
      router.push(`/documents/${id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (error && !form) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <p className="text-red-600">{error}</p>
        <Link href="/documents" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          ← Back to Documents
        </Link>
      </div>
    );
  }

  if (!form) {
    return <div className="max-w-2xl mx-auto py-10 text-gray-400 text-sm">Loading…</div>;
  }

  const isUrdu = form.language === 'ur';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/documents" className="hover:text-blue-600">Documents</Link>
        <span>/</span>
        <Link href={`/documents/${id}`} className="hover:text-blue-600 font-mono text-gray-700">
          {doc?.referenceNumber || id}
        </Link>
        <span>/</span>
        <span>Edit</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Document</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Language */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Document Language
          </label>
          <select
            value={form.language}
            onChange={(e) => setFlat('language', e.target.value)}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
        </div>

        {/* Sender */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Sender
          </legend>
          <Field
            label="Original (as in document)"
            value={form.sender.original}
            onChange={(v) => setNested('sender', 'original', v)}
            dir={isUrdu ? 'rtl' : 'ltr'}
            disabled={saving}
          />
          <Field
            label="English"
            value={form.sender.english}
            onChange={(v) => setNested('sender', 'english', v)}
            dir="ltr"
            disabled={saving}
          />
          <Field
            label="Urdu"
            value={form.sender.urdu}
            onChange={(v) => setNested('sender', 'urdu', v)}
            dir="rtl"
            placeholder="اردو نام"
            disabled={saving}
          />
        </fieldset>

        {/* Origin */}
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Origin / Address
          </legend>
          <textarea
            value={form.origin}
            onChange={(e) => setFlat('origin', e.target.value)}
            rows={3}
            disabled={saving}
            dir={isUrdu ? 'rtl' : 'ltr'}
            placeholder="Full address or location…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
          />
        </fieldset>

        {/* Topic */}
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
              disabled={saving}
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
              disabled={saving}
              dir="rtl"
              placeholder="اردو میں خلاصہ…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
            />
          </div>
        </fieldset>

        {/* Remarks */}
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Remarks
          </legend>
          <textarea
            value={form.remarks}
            onChange={(e) => setFlat('remarks', e.target.value)}
            rows={3}
            disabled={saving}
            dir={isUrdu ? 'rtl' : 'ltr'}
            placeholder="e.g. Assigned to Hamid Ali, or: Please expedite"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
          />
        </fieldset>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href={`/documents/${id}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Link>
          <Button onClick={handleSave} loading={saving} disabled={saving}>
            Save Changes
          </Button>
        </div>

      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir = 'ltr', placeholder = '', disabled }) {
  return (
    <div>
      {label && <label className="block text-xs text-gray-500 mb-0.5">{label}</label>}
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
