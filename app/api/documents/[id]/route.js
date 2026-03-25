import { NextResponse } from 'next/server';
import { getDocumentById, updateDocument, deleteDocument } from '@/lib/services/document.service';
import { deleteFile } from '@/lib/services/file.service';
import { generateEmbedding } from '@/lib/services/gemini.service';
import { buildSearchText } from '@/lib/utils/formatters';
import { errorResponse } from '@/lib/utils/errors';

export async function GET(request, { params }) {
  try {
    const doc = await getDocumentById(params.id);
    return NextResponse.json({ success: true, document: serializeDoc(doc) });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: err.statusCode || 500 });
  }
}

/**
 * PATCH /api/documents/[id]
 *
 * Called when the user reviews the extracted data and clicks Save.
 * Accepts the (possibly amended) extractedData, generates embeddings,
 * and marks the document as completed.
 */
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { extractedData } = body;

    if (!extractedData) {
      return NextResponse.json(
        { success: false, error: 'extractedData is required' },
        { status: 400 }
      );
    }

    // Build searchable text from the confirmed data
    const searchText = buildSearchText(extractedData);

    // Generate embedding — returns null gracefully if model is unavailable
    const embedding = await generateEmbedding(searchText || '').catch(() => null);

    const update = {
      status: 'completed',
      extractedData,
      searchText,
      ...(embedding ? { embedding } : {}),
    };

    const doc = await updateDocument(params.id, update);
    return NextResponse.json({ success: true, document: serializeDoc(doc) });

  } catch (err) {
    console.error('Save error:', err);
    return NextResponse.json(errorResponse(err), { status: err.statusCode || 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const doc = await deleteDocument(params.id);
    await deleteFile(doc.file.storedPath).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: err.statusCode || 500 });
  }
}

function serializeDoc(doc) {
  return {
    ...doc,
    id: doc._id?.toString(),
    _id: undefined,
    embedding: undefined,
  };
}
