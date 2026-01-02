import { NextResponse } from 'next/server';
import { requireDb, nodes } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id: projectId } = await params;

    const projectNodes = await db
      .select()
      .from(nodes)
      .where(eq(nodes.projectId, projectId));

    return NextResponse.json(projectNodes);
  } catch (error) {
    console.error('Failed to fetch nodes:', error);
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id: projectId } = await params;
    const body = await request.json();

    const nodeId = body.id || `node-${randomUUID().slice(0, 8)}`;

    const [node] = await db
      .insert(nodes)
      .values({
        id: nodeId,
        projectId,
        type: body.type,
        label: body.label,
        positionX: body.position?.x ?? 0,
        positionY: body.position?.y ?? 0,
        data: body.data ?? {},
      })
      .returning();

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error('Failed to create node:', error);
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id: projectId } = await params;
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Expected array of nodes' }, { status: 400 });
    }

    await db.delete(nodes).where(eq(nodes.projectId, projectId));

    if (body.length > 0) {
      await db.insert(nodes).values(
        body.map((n: { id: string; type: string; label: string; position: { x: number; y: number }; data: Record<string, unknown> }) => ({
          id: n.id,
          projectId,
          type: n.type,
          label: n.label,
          positionX: n.position?.x ?? 0,
          positionY: n.position?.y ?? 0,
          data: n.data ?? {},
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update nodes:', error);
    return NextResponse.json({ error: 'Failed to update nodes' }, { status: 500 });
  }
}
