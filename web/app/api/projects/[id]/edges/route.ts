import { NextResponse } from 'next/server';
import { requireDb, edges } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id: projectId } = await params;

    const projectEdges = await db
      .select()
      .from(edges)
      .where(eq(edges.projectId, projectId));

    return NextResponse.json(projectEdges);
  } catch (error) {
    console.error('Failed to fetch edges:', error);
    return NextResponse.json({ error: 'Failed to fetch edges' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id: projectId } = await params;
    const body = await request.json();

    const edgeId = body.id || `edge-${randomUUID().slice(0, 8)}`;

    const [edge] = await db
      .insert(edges)
      .values({
        id: edgeId,
        projectId,
        source: body.source,
        target: body.target,
        animated: body.animated ?? true,
      })
      .returning();

    return NextResponse.json(edge, { status: 201 });
  } catch (error) {
    console.error('Failed to create edge:', error);
    return NextResponse.json({ error: 'Failed to create edge' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id: projectId } = await params;
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Expected array of edges' }, { status: 400 });
    }

    await db.delete(edges).where(eq(edges.projectId, projectId));

    if (body.length > 0) {
      await db.insert(edges).values(
        body.map((e: { id: string; source: string; target: string; animated?: boolean }) => ({
          id: e.id,
          projectId,
          source: e.source,
          target: e.target,
          animated: e.animated ?? true,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update edges:', error);
    return NextResponse.json({ error: 'Failed to update edges' }, { status: 500 });
  }
}
