import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email_confirmed_at) {
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

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || 'user'
    if (userRole === 'admin') {
      return redirect('/dashboard')
    }
      return redirect('/form')
}