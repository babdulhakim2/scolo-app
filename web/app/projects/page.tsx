import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireDb, projects } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware handles auth, but we still need user for the query
  if (!user) {
    // This shouldn't happen with middleware, but keep as safety
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
    } else {
      redirect('/projects/new');
    }
  } catch (error) {
    // Don't catch NEXT_REDIRECT errors
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = (error as any).digest;
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        throw error;
      }
    }
    console.error('Failed to fetch projects:', error);
    redirect('/projects/new');
  }
}