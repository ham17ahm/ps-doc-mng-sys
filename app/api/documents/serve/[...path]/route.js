import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

/**
 * Secure file serving route.
 * GET /api/documents/serve/uploads/2026-03/uuid.pdf
 *
 * Validates the path stays within the uploads directory to prevent
 * path traversal attacks.
 */
export async function GET(request, { params }) {
  try {
    const segments = params.path || [];
    const relativePath = segments.join('/');

    // Security: only serve files under /uploads/
    if (!relativePath.startsWith('uploads/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const absPath = path.resolve(process.cwd(), relativePath);
    const uploadsRoot = path.resolve(process.cwd(), 'uploads');

    // Prevent path traversal
    if (!absPath.startsWith(uploadsRoot)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let buffer;
    try {
      buffer = await fs.readFile(absPath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Infer Content-Type from extension
    const ext = path.extname(absPath).toLowerCase();
    const contentTypeMap = {
      '.pdf':  'application/pdf',
      '.jpg':  'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png':  'image/png',
      '.webp': 'image/webp',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    return new Response(buffer, {
      headers: {
        'Content-Type':  contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });

  } catch (err) {
    console.error('File serve error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
