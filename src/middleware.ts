import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUser } from 'services/auth/getAuthenticatedUser'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const access_token = request.cookies.get('Authorization')?.value

    if (!access_token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const tenant = pathname.split('/').filter(Boolean)[0]

    if (!tenant) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const response = NextResponse.next()

    response.cookies.set('X-tenant', tenant, {
        path: '/',
        httpOnly: false
    })

    try {
        await getAuthenticatedUser(tenant)
    } catch{
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
}

export const config = {
    matcher: ['/:tenant((?!login|_next|api|static|public|favicon.ico|images|icons|fonts|sources).*)']
}
