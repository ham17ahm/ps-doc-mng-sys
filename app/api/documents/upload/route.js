import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { validateAndStore } from '@/lib/services/file.service';
import { createDocument } from '@/lib/services/document.service';
import { generateReferenceNumber } from '@/lib/services/reference.service';
import { extractionQueue } from '@/lib/queue/processor';
import { validateFileBatch } from '@/lib/utils/validators';
import { errorResponse } from '@/lib/utils/errors';

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const files = formData.getAll('files');

    validateFileBatch(files);

    const results = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const storedFile = await validateAndStore(buffer, file.name, file.type);
      const referenceNumber = await generateReferenceNumber();

      const doc = await createDocument({
        referenceNumber,
        file: {
          originalName: storedFile.originalName,
          storedPath:   storedFile.storedPath,
          mimeType:     storedFile.mimeType,
          sizeBytes:    storedFile.sizeBytes,
          pageCount:    storedFile.pageCount,
        },
        status: 'queued',
      });

      extractionQueue.enqueue({
        documentId: doc._id.toString(),
        storedPath: storedFile.storedPath,
        mimeType:   storedFile.mimeType,
      });

      results.push({
        id:              doc._id.toString(),
        referenceNumber: doc.referenceNumber,
        fileName:        storedFile.originalName,
        status:          'queued',
      });
    }

    return NextResponse.json({ success: true, documents: results }, { status: 202 });

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(errorResponse(err), { status: err.statusCode || 500 });
  }
}
