import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { getDocumentById, updateDocument } from '@/lib/services/document.service';
import { extractionQueue } from '@/lib/queue/processor';
import { errorResponse } from '@/lib/utils/errors';

/**
 * POST /api/documents/[id]/reextract
 *
 * Re-queues an existing document for extraction with a (possibly different) prompt.
 * Resets status to 'queued' and enqueues the job.
 */
export async function POST(request, { params }) {
  try {
    await connectDB();

    const body = await request.json();
    const promptName = body.promptName || 'extraction';

    const doc = await getDocumentById(params.id);

    // Reset status and update prompt
    await updateDocument(params.id, {
      status: 'queued',
      promptName,
      errorMessage: null,
    });

    // Enqueue for re-extraction
    extractionQueue.enqueue({
      documentId:  doc._id.toString(),
      storedPath:  doc.file.storedPath,
      mimeType:    doc.file.mimeType,
      promptName,
    });

    return NextResponse.json({ success: true, status: 'queued', promptName });

  } catch (err) {
    console.error('Re-extract error:', err);
    return NextResponse.json(errorResponse(err), { status: err.statusCode || 500 });
  }
}
