import Badge from '@/components/ui/Badge';
import { formatFileSize, formatDisplayDate } from '@/lib/utils/formatters';

export default function MetadataPanel({ doc }) {
  const { file, createdAt, updatedAt, status, promptName } = doc;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4 text-sm">
      <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Metadata</h3>

      <Row label="Status"><Badge variant={status}>{status}</Badge></Row>
      {promptName && <Row label="Prompt">{promptName}</Row>}

      {file && (
        <>
          <Row label="File">{file.originalName}</Row>
          <Row label="Type">{file.mimeType}</Row>
          <Row label="Size">{formatFileSize(file.sizeBytes)}</Row>
          {file.pageCount && <Row label="Pages">{file.pageCount}</Row>}
        </>
      )}

      {createdAt && <Row label="Uploaded">{formatDisplayDate(createdAt)}</Row>}
      {updatedAt && <Row label="Updated">{formatDisplayDate(updatedAt)}</Row>}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-gray-900 text-right">{children}</span>
    </div>
  );
}
