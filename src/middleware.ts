import { NextRequest, NextResponse } from 'next/server';
import { KeyLike, jwtVerify } from 'jose';

const freeCheckSources = ['/login', '/register', '/email', '/reset', '/resetEmail', '/forget', '/about', '/'];

export async function middleware(request: NextRequest) {
    const jwt: any = request.cookies.get('userToken')?.value;
    
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    try {
        if (!jwt) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (request.nextUrl.pathname === '/products' || request.nextUrl.pathname === '/payment/back') {
            return NextResponse.redirect(new URL('/select-plan', request.url));
        }

        const { payload } = await jwtVerify(jwt, new TextEncoder().encode(process.env.NEXTAUTH_SECRET as string));

        return response;        
    } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/account/:path*', '/admin/:path*', '/products/:path*', '/payment/:path*']
};
