import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('sb-access-token')?.value

    const isLoginPage = pathname === '/admin/login'
    const isAdminRoute = pathname.startsWith('/admin')

    if (isAdminRoute && !isLoginPage && !token) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (isLoginPage && token) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}