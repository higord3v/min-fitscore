import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('🔄 Middleware executando para:', req.nextUrl.pathname)
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ Erro na sessão:', sessionError)
    }

    console.log('✅ Sessão encontrada:', !!session)

    if (!session && (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/form'))) {
      console.log('❌ Não autenticado, redirecionando para login')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (session && req.nextUrl.pathname === '/login') {
      console.log('✅ Já autenticado, redirecionando para /')
      return NextResponse.redirect(new URL('/', req.url))
    }

  } catch (error) {
    console.error('❌ Erro no middleware:', error)
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/form/:path*',
    '/login',
  ],
}