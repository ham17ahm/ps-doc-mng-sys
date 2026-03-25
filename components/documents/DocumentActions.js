'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DocumentActions({ id }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) return;
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/documents');
      router.refresh();
    } else {
      alert('Delete failed. Please try again.');
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/documents/${id}/edit`}
        className="text-xs px-2.5 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        className="text-xs px-2.5 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
      >
        Delete
      </button>
    </div>
  );
}
