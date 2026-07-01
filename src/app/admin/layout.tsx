import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminLayout from '@/components/admin/AdminLayout';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/admin');
  }

  // Verificar rol admin
  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (!profile || profile.rol !== 'admin') {
    redirect('/');
  }

  return <AdminLayout>{children}</AdminLayout>;
}
