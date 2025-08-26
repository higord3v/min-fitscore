import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verificar se o email foi confirmado
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email_confirmed_at) {
    // Se email não confirmado, vai para página de aviso
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-center mb-4">Confirme seu email</h1>
          <p className="text-center text-gray-600">
            Por favor, verifique sua caixa de entrada e clique no link de confirmação.
          </p>
        </div>
      </div>
    )
  }

  // Verificar se é admin
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = profile?.role || 'user'
    if (userRole === 'admin') {
      redirect('/dashboard')
    } else {
      console.log(userRole)
      redirect('/form')
    }
  } catch (error) {
    redirect('/form')
  }
}