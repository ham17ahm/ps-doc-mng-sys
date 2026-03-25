'use client';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatFileSize } from '@/lib/utils/formatters';

const STATUS_LABEL = {
  pending:    'Pending',
  uploading:  'Uploading…',
  queued:     'Queued',
  processing: 'Processing…',
  extracted:  'Ready to Review',
  saving:     'Saving…',
  completed:  'Saved',
  failed:     'Failed',
};

const STATUS_ICON = {
  pending:    '⏳',
  uploading:  '⬆️',
  queued:     '🕐',
  processing: '⚙️',
  extracted:  '📋',
  saving:     '💾',
  completed:  '✅',
  failed:     '❌',
};

export default function UploadQueue({ files, isUploading, onRemove, onUpload, onClear, allDone }) {
  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const canUpload    = pendingCount > 0 && !isUploading;

  return (
    <div className="space-y-4 mt-6">
      <div className="space-y-2">
        {files.map((item) => (
          <FileRow key={item.id} item={item} onRemove={onRemove} />
        ))}
      </div>

      <div className="flex gap-3">
        {canUpload && (
          <Button onClick={onUpload} loading={isUploading}>
            Upload {pendingCount} File{pendingCount !== 1 ? 's' : ''}
          </Button>
        )}
        {allDone && (
          <Button variant="secondary" onClick={onClear}>
            Upload More
          </Button>
        )}
        {!allDone && files.length > 0 && (
          <Button variant="ghost" onClick={onClear} disabled={isUploading}>
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}

function FileRow({ item, onRemove }) {
  const { file, status, step, progress, referenceNumber, documentId, error } = item;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="text-2xl flex-shrink-0">
        {file.type === 'application/pdf' ? '📄' : '🖼️'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
          <Badge variant={status}>{STATUS_ICON[status]} {STATUS_LABEL[status]}</Badge>
        </div>
        <p className="text-xs text-gray-500">
          {formatFileSize(file.size)}
          {referenceNumber && <> · <span className="font-mono">{referenceNumber}</span></>}
          {step  && <> · {step}</>}
          {error && <span className="text-red-600"> · {error}</span>}
        </p>

        {(status === 'uploading' || status === 'processing') && (
          <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress || 0}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        {status === 'completed' && documentId && (
          <Link href={`/documents/${documentId}`} className="text-xs text-blue-600 hover:underline">
            View →
          </Link>
        )}
        {status === 'extracted' && (
          <span className="text-xs text-blue-600">Review below ↓</span>
        )}
        {status === 'pending' && (
          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
