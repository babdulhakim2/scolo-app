import ScoloCanvas from '@/app/components/canvas/ScoloCanvas';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { loadInitialCanvasData } from '@/lib/data/loaders';

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware handles auth, but we still need user for data loading
  if (!user) {
    // This shouldn't happen with middleware, but keep as safety
    redirect('/login');
  }

  const initialData = await loadInitialCanvasData(user.id, user.email || '');

  return (
    <ScoloCanvas
      initialProjects={initialData.projects}
      initialUser={initialData.user}
    />
  );
}
