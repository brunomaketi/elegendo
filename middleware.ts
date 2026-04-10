import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROTAS_PROTEGIDAS = ['/dashboard', '/agentes', '/historico', '/planos', '/perfil', '/calendario', '/admin']
const ROTAS_PUBLICAS = ['/login', '/cadastro']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtegida = ROTAS_PROTEGIDAS.some(r => pathname.startsWith(r))
  const isPublica = ROTAS_PUBLICAS.some(r => pathname.startsWith(r))

  if (!isProtegida && !isPublica) return NextResponse.next()

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rota protegida sem usuário → redireciona para login
  if (isProtegida && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Já logado tentando acessar login/cadastro → redireciona para dashboard
  if (isPublica && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Rota /admin — só seu email
  if (pathname.startsWith('/admin') && user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
