import { NextResponse } from 'next/server';
import { requireDb, projects, nodes, edges, investigations } from '@/lib/db';
import { eq } from 'drizzle-orm';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id } = await params;

    const [project] = await db.select().from(projects).where(eq(projects.id, id));

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectNodes = await db.select().from(nodes).where(eq(nodes.projectId, id));
    const projectEdges = await db.select().from(edges).where(eq(edges.projectId, id));
    const projectInvestigations = await db
      .select()
      .from(investigations)
      .where(eq(investigations.projectId, id));

    return NextResponse.json({
      ...project,
      nodes: projectNodes,
      edges: projectEdges,
      investigations: projectInvestigations,
    });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(projects)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status !== undefined) updateData.status = body.status;
    if (body.riskLevel !== undefined) updateData.riskLevel = body.riskLevel;
    if (body.totalFindings !== undefined) updateData.totalFindings = body.totalFindings;
    if (body.toolsCompleted !== undefined) updateData.toolsCompleted = body.toolsCompleted;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.entityName !== undefined) updateData.entityName = body.entityName;
    if (body.entityType !== undefined) updateData.entityType = body.entityType;
    if (body.country !== undefined) updateData.country = body.country;

    const [updated] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to patch project:', error);
    return NextResponse.json({ error: 'Failed to patch project' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id } = await params;

    const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
