import { NextRequest, NextResponse } from 'next/server';
import { KeyLike, jwtVerify } from 'jose';

const freeCheckSources = ['/login, /register', '/email', '/reset', '/resetEmail', '/forget', '/about', '/']

export async function middleware(request: NextRequest) {
    const jwt: any = request.cookies.get('userToken')?.value
    try {
        if(jwt === undefined) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (request.nextUrl.pathname === '/home') {
            return NextResponse.redirect(new URL('/products', request.url));
          }

        const { payload } = await jwtVerify(jwt, new TextEncoder().encode(process.env.NEXTAUTH_SECRET as string))

        return NextResponse.next()        
    } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url))
    }


}

export const config = {
    matcher: ['/account/:path*', '/admin/:path*']
}