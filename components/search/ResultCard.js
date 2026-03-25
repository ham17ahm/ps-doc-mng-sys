'use client';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { truncate, formatDisplayDate, formatFileSize } from '@/lib/utils/formatters';

const LANG_LABEL = { en: 'EN', ur: 'UR' };

export default function ResultCard({ doc }) {
  const { id, referenceNumber, file, extractedData, createdAt, score } = doc;

  const sender   = extractedData?.sender?.english || extractedData?.sender?.original || '';
  const topicEn  = extractedData?.topic?.english || '';
  const topicUr  = extractedData?.topic?.urdu || '';
  const origin   = extractedData?.origin || '';
  const remarks  = extractedData?.remarks || '';
  const language = extractedData?.language || 'en';

  return (
    <Link href={`/documents/${id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">

        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-400">{referenceNumber}</span>
            {language && <Badge variant={language}>{LANG_LABEL[language] || language}</Badge>}
          </div>
          {typeof score === 'number' && (
            <span className="text-xs text-gray-400">{Math.round(score * 100)}% match</span>
          )}
        </div>

        {/* Topic */}
        {(topicEn || topicUr) && (
          <div className="mb-3 space-y-1">
            {topicEn && (
              <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors text-sm leading-snug">
                {truncate(topicEn, 140)}
              </p>
            )}
            {topicUr && (
              <p className="text-sm text-gray-600 leading-snug text-right" dir="rtl">
                {truncate(topicUr, 140)}
              </p>
            )}
          </div>
        )}

        {/* Sender / Remarks / Origin */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3 text-xs text-gray-500">
          {sender  && <span><span className="font-medium text-gray-600">From:</span> {sender}</span>}
          {remarks && <span><span className="font-medium text-gray-600">Remarks:</span> {truncate(remarks, 60)}</span>}
          {origin  && <span><span className="font-medium text-gray-600">Origin:</span> {truncate(origin, 60)}</span>}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-end gap-3 text-xs text-gray-400">
          <span>{file?.mimeType === 'application/pdf' ? '📄 PDF' : '🖼️ Image'}</span>
          {file?.sizeBytes && <span>{formatFileSize(file.sizeBytes)}</span>}
          {createdAt && <span>{formatDisplayDate(createdAt)}</span>}
        </div>

      </div>
    </Link>
  );
}
