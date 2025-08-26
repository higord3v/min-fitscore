import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createServer()
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()
  if (!session) {
    redirect('/login')
  }

  // Verificar se é admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/form')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com logout */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-sm text-gray-600">Bem-vindo, {user?.email}!</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Conteúdo do dashboard */}
      <main className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Painel de Controle</h2>
          <p>Esta é a área administrativa do sistema.</p>
          {/* Adicione aqui o conteúdo do dashboard */}
        </div>
      </main>
    </div>
  )
}