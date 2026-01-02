import ScoloCanvas from '@/app/components/canvas/ScoloCanvas';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <ScoloCanvas />;
}
