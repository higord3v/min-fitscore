import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function FormPage() {
  const supabase = await createServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verificar se o email foi confirmado
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-center mb-4">Email não confirmado</h1>
          <p className="text-center text-gray-600 mb-6">
            Por favor, verifique seu email e clique no link de confirmação para acessar o formulário.
          </p>
          <div className="text-center">
            <form action={async () => {
              'use server'
              const supabase = await createServer()
              await supabase.auth.resend({
                type: 'signup',
                email: user?.email!,
              })
            }}>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reenviar email de confirmação
              </button>
            </form>
          </div>
          <div className="text-center mt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com logout */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Formulário de Avaliação</h1>
            <p className="text-sm text-gray-600">Bem-vindo, {user.email}!</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Conteúdo do formulário */}
      <main className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Avaliação do Candidato</h2>
          <p>Seu email foi confirmado com sucesso!</p>
          {/* Adicione aqui o formulário de avaliação */}
          <div className="mt-6 p-4 border border-dashed border-gray-300 rounded">
            <p className="text-gray-600 text-center">
              Formulário de avaliação será implementado aqui
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}