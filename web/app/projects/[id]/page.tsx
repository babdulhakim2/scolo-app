import ScoloCanvas from '@/app/components/canvas/ScoloCanvas';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { requireDb, projects } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  try {
    const db = requireDb();
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)));

    if (!project) {
      notFound();
    }

    return <ScoloCanvas projectId={id} />;
  } catch (error) {
    console.error('Failed to fetch project:', error);
    notFound();
  }
}
