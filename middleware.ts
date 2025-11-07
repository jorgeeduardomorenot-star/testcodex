import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/carrito', '/checkout', '/compras', '/soporte']
  const adminRoutes = ['/admin']

  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if not authenticated
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check admin access
  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/carrito/:path*',
    '/checkout/:path*',
    '/compras/:path*',
    '/soporte/:path*',
    '/admin/:path*',
  ],
}
