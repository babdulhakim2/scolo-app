import { NextResponse } from 'next/server';
import { requireDb, edges } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

type RouteParams = { params: Promise<{ id: string; edgeId: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id: projectId, edgeId } = await params;

    const [deleted] = await db
      .delete(edges)
      .where(and(eq(edges.id, edgeId), eq(edges.projectId, projectId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Edge not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete edge:', error);
    return NextResponse.json({ error: 'Failed to delete edge' }, { status: 500 });
  }
}
