import Link from 'next/link';
import { listDocuments } from '@/lib/services/search.service';
import { formatDisplayDate, truncate } from '@/lib/utils/formatters';
import Badge from '@/components/ui/Badge';
import DocumentActions from '@/components/documents/DocumentActions';

export const metadata = { title: 'Recent Documents — DocExtract' };

// Revalidate every 60 seconds so the list stays reasonably fresh
export const revalidate = 60;

export default async function DocumentsPage() {
  const { results: docs } = await listDocuments({}, 1, 50);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recent Documents</h1>
        <p className="text-gray-500 mt-1">The 50 most recently uploaded documents.</p>
      </div>

      {docs.length === 0 ? (
        <p className="text-gray-400 italic text-sm">No documents uploaded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 text-left font-semibold">Reference</th>
                <th className="px-4 py-3 text-left font-semibold">Sender</th>
                <th className="px-4 py-3 text-left font-semibold">Topic</th>
                <th className="px-4 py-3 text-left font-semibold">Origin</th>
                <th className="px-4 py-3 text-left font-semibold">Remarks</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map((doc) => (
                <tr key={doc._id.toString()} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {doc.referenceNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-800 max-w-[160px]">
                    {doc.extractedData?.sender?.english || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-[260px]">
                    {doc.extractedData?.topic?.english
                      ? truncate(doc.extractedData.topic.english, 80)
                      : <span className="text-gray-400 italic">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                    {doc.extractedData?.origin
                      ? truncate(doc.extractedData.origin, 60)
                      : <span className="text-gray-400 italic">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                    {doc.extractedData?.remarks
                      ? truncate(doc.extractedData.remarks, 80)
                      : <span className="text-gray-400 italic">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {doc.createdAt ? formatDisplayDate(doc.createdAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={doc.status}>{doc.status}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/documents/${doc._id.toString()}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View
                      </Link>
                      <DocumentActions id={doc._id.toString()} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
