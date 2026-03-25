import { connectDB } from '@/lib/db/connection';
import { DocumentModel } from '@/lib/db/models/Document';
import { generateEmbedding } from '@/lib/services/gemini.service';
import { RRF_K, DEFAULT_PAGE_SIZE } from '@/lib/config/constants';

export async function hybridSearch(params) {
  const {
    query,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    dateFrom,
    dateTo,
    sort = 'relevance',
  } = params;

  await connectDB();

  const queryEmbedding = await generateEmbedding(query).catch(() => null);
  const filters = { dateFrom, dateTo };
  const searchLimit = limit * 5;

  const [vectorResults, textResults] = await Promise.all([
    queryEmbedding ? vectorSearch(queryEmbedding, filters, searchLimit) : Promise.resolve([]),
    textSearch(query, filters, searchLimit),
  ]);

  let merged = reciprocalRankFusion(vectorResults, textResults);

  if (sort === 'date_desc') {
    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'date_asc') {
    merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  const total  = merged.length;
  const start  = (page - 1) * limit;
  const results = merged.slice(start, start + limit);

  return {
    results,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function vectorSearch(embedding, filters, limit) {
  const pipeline = [
    {
      $vectorSearch: {
        index: 'vector_search_index',
        path: 'embedding',
        queryVector: embedding,
        numCandidates: limit * 10,
        limit,
        filter: buildAtlasFilter(filters),
      },
    },
    {
      $project: {
        _id: 1, referenceNumber: 1, file: 1,
        extractedData: 1, createdAt: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];

  try {
    return await DocumentModel.aggregate(pipeline);
  } catch (err) {
    console.warn('Vector search failed (index may not exist):', err.message);
    return [];
  }
}

async function textSearch(query, filters, limit) {
  const match = { $text: { $search: query }, status: 'completed' };

  if (filters.dateFrom || filters.dateTo) {
    match.createdAt = {};
    if (filters.dateFrom) match.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo)   match.createdAt.$lte = new Date(filters.dateTo);
  }

  try {
    return await DocumentModel.find(match)
      .select({
        referenceNumber: 1, file: 1, extractedData: 1, createdAt: 1,
        score: { $meta: 'textScore' },
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();
  } catch (err) {
    console.warn('Text search error:', err.message);
    return [];
  }
}

function reciprocalRankFusion(vectorResults, textResults) {
  const scoreMap = new Map();

  vectorResults.forEach((doc, rank) => {
    const id = doc._id.toString();
    const entry = scoreMap.get(id) || { doc, score: 0 };
    entry.score += 1 / (RRF_K + rank + 1);
    scoreMap.set(id, entry);
  });

  textResults.forEach((doc, rank) => {
    const id = doc._id.toString();
    const entry = scoreMap.get(id) || { doc, score: 0 };
    entry.score += 1 / (RRF_K + rank + 1);
    scoreMap.set(id, entry);
  });

  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .map(({ doc, score }) => ({ ...doc, score: Math.round(score * 1000) / 1000 }));
}

function buildAtlasFilter(filters) {
  const filter = { status: { $eq: 'completed' } };
  if (filters.dateFrom) filter.createdAt = { ...(filter.createdAt || {}), $gte: new Date(filters.dateFrom) };
  if (filters.dateTo)   filter.createdAt = { ...(filter.createdAt || {}), $lte: new Date(filters.dateTo) };
  return filter;
}

export async function listDocuments(filters = {}, page = 1, limit = DEFAULT_PAGE_SIZE) {
  await connectDB();
  const match = {};

  if (filters.dateFrom || filters.dateTo) {
    match.createdAt = {};
    if (filters.dateFrom) match.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo)   match.createdAt.$lte = new Date(filters.dateTo);
  }

  const [docs, total] = await Promise.all([
    DocumentModel.find(match)
      .select('referenceNumber file extractedData createdAt status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    DocumentModel.countDocuments(match),
  ]);

  return { results: docs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
