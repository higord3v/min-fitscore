import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verificar se é admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/form')
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <p>Bem-vindo, {session.user.email}!</p>
    </div>
  )
}