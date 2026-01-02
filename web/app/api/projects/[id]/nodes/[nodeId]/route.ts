import { NextResponse } from 'next/server';
import { requireDb, nodes } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

type RouteParams = { params: Promise<{ id: string; nodeId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id: projectId, nodeId } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.positionX !== undefined) updateData.positionX = body.positionX;
    if (body.positionY !== undefined) updateData.positionY = body.positionY;
    if (body.label !== undefined) updateData.label = body.label;
    if (body.data !== undefined) updateData.data = body.data;

    const [updated] = await db
      .update(nodes)
      .set(updateData)
      .where(and(eq(nodes.id, nodeId), eq(nodes.projectId, projectId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update node:', error);
    return NextResponse.json({ error: 'Failed to update node' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id: projectId, nodeId } = await params;

    const [deleted] = await db
      .delete(nodes)
      .where(and(eq(nodes.id, nodeId), eq(nodes.projectId, projectId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete node:', error);
    return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 });
  }
}
