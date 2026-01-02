import { NextResponse } from 'next/server';
import { requireDb, projects } from '@/lib/db';
import { desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const db = requireDb();
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));

    return NextResponse.json(allProjects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = requireDb();
    const body = await request.json();
    const { id: providedId, name, entityName, entityType = 'company', country, status = 'pending' } = body;

    if (!entityName) {
      return NextResponse.json(
        { error: 'entityName is required' },
        { status: 400 }
      );
    }

    const id = providedId || `proj-${randomUUID().slice(0, 8)}`;
    const projectName = name || `Investigation: ${entityName}`;

    const [project] = await db
      .insert(projects)
      .values({
        id,
        name: projectName,
        entityName,
        entityType,
        country,
        status,
      })
      .returning();

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
