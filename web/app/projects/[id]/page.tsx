import ScoloCanvas from '@/app/components/canvas/ScoloCanvas';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { loadInitialCanvasData } from '@/lib/data/loaders';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware handles auth, but we still need user for data loading
  if (!user) {
    // This shouldn't happen with middleware, but keep as safety
    redirect('/login');
  }

  try {
    const initialData = await loadInitialCanvasData(user.id, user.email || '', id);

    if (!initialData.currentProject) {
      notFound();
    }

    return (
      <ScoloCanvas
        projectId={id}
        initialProjects={initialData.projects}
        initialUser={initialData.user}
        initialNodes={initialData.currentProject.nodes}
        initialEdges={initialData.currentProject.edges}
      />
    );
  } catch (error) {
    console.error('Failed to fetch project:', error);
    notFound();
  }
}
