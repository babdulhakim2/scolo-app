import { NextResponse } from 'next/server';
import { requireDb, projects } from '@/lib/db';
import { desc, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = requireDb();
    const allProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .orderBy(desc(projects.createdAt));

    return NextResponse.json(allProjects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = requireDb();
    const body = await request.json();
    const { id: providedId, name, entityName, entityType = 'company', country, status = 'pending' } = body;

    if (!entityName) {
      return NextResponse.json(
        { error: 'entityName is required' },
        { status: 400 }
      );
    }

    const id = providedId || createId();
    const projectName = name || `Investigation: ${entityName}`;

    const [project] = await db
      .insert(projects)
      .values({
        id,
        userId: user.id,
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
