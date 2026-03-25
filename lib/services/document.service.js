import { connectDB } from '@/lib/db/connection';
import { DocumentModel } from '@/lib/db/models/Document';
import { NotFoundError } from '@/lib/utils/errors';

export async function createDocument(data) {
  await connectDB();
  const doc = new DocumentModel(data);
  await doc.save();
  return doc;
}

export async function getDocumentById(id) {
  await connectDB();
  const doc = await DocumentModel.findById(id).lean();
  if (!doc) throw new NotFoundError('Document');
  return doc;
}

export async function updateDocument(id, update) {
  await connectDB();
  const doc = await DocumentModel.findByIdAndUpdate(id, update, { returnDocument: 'after' }).lean();
  if (!doc) throw new NotFoundError('Document');
  return doc;
}

export async function deleteDocument(id) {
  await connectDB();
  const doc = await DocumentModel.findByIdAndDelete(id).lean();
  if (!doc) throw new NotFoundError('Document');
  return doc;
}

export async function getDocumentStatus(id) {
  await connectDB();
  const doc = await DocumentModel
    .findById(id)
    .select('status errorMessage referenceNumber extractedData')
    .lean();
  if (!doc) throw new NotFoundError('Document');
  return doc;
}
