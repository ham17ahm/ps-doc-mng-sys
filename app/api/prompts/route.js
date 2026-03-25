import { NextResponse } from 'next/server';
import { listPromptsWithMeta } from '@/lib/prompts';

/**
 * GET /api/prompts
 *
 * Returns all available prompt configs (name + description)
 * for the frontend dropdown.
 */
export async function GET() {
  try {
    const prompts = await listPromptsWithMeta();
    return NextResponse.json({ success: true, prompts });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
