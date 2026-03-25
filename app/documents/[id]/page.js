import { notFound } from 'next/navigation';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import ExtractedDataView from '@/components/documents/ExtractedDataView';
import MetadataPanel from '@/components/documents/MetadataPanel';
import { formatDisplayDate } from '@/lib/utils/formatters';

// Fetch document server-side
async function getDocument(id) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/documents/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.document : null;
}

export async function generateMetadata({ params }) {
  const doc = await getDocument(params.id);
  return {
    title: doc
      ? `${doc.referenceNumber} — DocExtract`
      : 'Document — DocExtract',
  };
}

export default async function DocumentPage({ params }) {
  const doc = await getDocument(params.id);
  if (!doc) notFound();

  const isImage = doc.file?.mimeType?.startsWith('image/');
  const fileUrl = `/api/documents/serve/${doc.file?.storedPath}`;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/search" className="hover:text-blue-600">Search</Link>
        <span>/</span>
        <span className="font-mono text-gray-700">{doc.referenceNumber}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-gray-500">{doc.referenceNumber}</span>
            <Badge variant={doc.status}>{doc.status}</Badge>
          </div>
          <h1
            className="text-2xl font-bold text-gray-900"
            dir={doc.extractedData?.language === 'ur' ? 'rtl' : 'ltr'}
          >
            {doc.extractedData?.topic?.english || doc.file?.originalName || 'Document'}
          </h1>
          {doc.createdAt && (
            <p className="text-sm text-gray-500 mt-1">
              Uploaded {formatDisplayDate(doc.createdAt)}
            </p>
          )}
        </div>

        {/* Download button */}
        <a
          href={fileUrl}
          download={doc.file?.originalName}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Download Original
        </a>
      </div>

      {/* Processing states */}
      {doc.status === 'queued' && (
        <StatusBanner color="yellow" icon="🕐" message="This document is queued for processing." />
      )}
      {doc.status === 'processing' && (
        <StatusBanner color="blue" icon="⚙️" message="Extraction in progress — refresh in a moment." />
      )}
      {doc.status === 'failed' && (
        <StatusBanner color="red" icon="❌" message={`Extraction failed: ${doc.errorMessage || 'Unknown error'}`} />
      )}

      {/* Main two-column layout */}
      {doc.status === 'completed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: document viewer */}
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div className="px-5 py-3 border-b border-gray-100 text-sm font-medium text-gray-700">
              Original Document
            </div>
            <div className="p-4" style={{ minHeight: '500px' }}>
              {isImage ? (
                <img
                  src={fileUrl}
                  alt={doc.file?.originalName}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <iframe
                  src={fileUrl}
                  title="Document preview"
                  className="w-full rounded-lg border border-gray-100"
                  style={{ height: '600px' }}
                />
              )}
            </div>
          </div>

          {/* Right: extracted data */}
          <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-4">
                Extracted Data
              </h2>
              <ExtractedDataView data={doc.extractedData} />
            </div>

            <MetadataPanel doc={doc} />
          </div>
        </div>
      )}

      {/* Show metadata even when not completed */}
      {doc.status !== 'completed' && (
        <div className="max-w-sm">
          <MetadataPanel doc={doc} />
        </div>
      )}
    </div>
  );
}

function StatusBanner({ color, icon, message }) {
  const colors = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    blue:   'bg-blue-50 border-blue-200 text-blue-800',
    red:    'bg-red-50 border-red-200 text-red-800',
  };
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-5 py-4 mb-6 ${colors[color]}`}>
      <span className="text-xl">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
