import { createServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServer()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: session.user.email!,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email reenviado com sucesso' })

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}