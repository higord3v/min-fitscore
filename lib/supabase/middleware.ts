import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Atualizar sessão
  const { data: { session } } = await supabase.auth.getSession()

  // Rotas protegidas
  const protectedRoutes = ['/dashboard', '/form']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Se não está logado e tenta acessar rota protegida
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se está logado e tenta acessar login, redireciona para página inicial
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
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