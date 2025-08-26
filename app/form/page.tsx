import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FormPage() {
  const supabase = await createServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Formulário de Avaliação</h1>
      <p>Bem-vindo, {session.user.email}!</p>
      {/* Seu formulário aqui */}
    </div>
  )
}