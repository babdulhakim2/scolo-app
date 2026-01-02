import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireDb, projects } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  try {
    const db = requireDb();
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .orderBy(desc(projects.updatedAt))
      .limit(1);

    if (userProjects.length > 0) {
      redirect(`/projects/${userProjects[0].id}`);
    }
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }

  redirect('/projects/new');
}
