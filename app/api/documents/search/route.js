import { NextResponse } from 'next/server';
import { hybridSearch, listDocuments } from '@/lib/services/search.service';
import { sanitizeQuery } from '@/lib/utils/validators';
import { errorResponse } from '@/lib/utils/errors';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/config/constants';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const query    = sanitizeQuery(searchParams.get('q') || '');
    const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit    = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE), 10)));
    const dateFrom = searchParams.get('dateFrom') || null;
    const dateTo   = searchParams.get('dateTo')   || null;
    const sort     = searchParams.get('sort') || 'relevance';

    const data = query
      ? await hybridSearch({ query, page, limit, dateFrom, dateTo, sort })
      : await listDocuments({ dateFrom, dateTo }, page, limit);

    const results = data.results.map(({ embedding, ...rest }) => ({
      ...rest,
      id: rest._id?.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ success: true, results, pagination: data.pagination });

  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json(errorResponse(err), { status: err.statusCode || 500 });
  }
}
