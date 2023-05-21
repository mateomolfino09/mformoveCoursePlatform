import { NextRequest, NextResponse } from 'next/server';
import { KeyLike, jwtVerify } from 'jose';

const freeCheckSources = ['/src/user/login, /src/user/register', '/src/user/email', '/src/user/reset', '/src/user/resetEmail', '/src/user/forget', '/aboutUs', '/']

export async function middleware(request: NextRequest) {
    const jwt: any = request.cookies.get('userToken')?.value

    try {
        if(jwt === undefined) {
            return NextResponse.redirect(new URL('/src/user/login', request.url))
        }

        const { payload } = await jwtVerify(jwt, new TextEncoder().encode(process.env.NEXTAUTH_SECRET as string))

        return NextResponse.next()        
    } catch (error) {
        console.log(error, jwt)
        return NextResponse.redirect(new URL('/src/user/login', request.url))
    }


}

export const config = {
    matcher: ['/src/user/account/:path*', '/src/home', '/src/admin/:path*', '/src/courses/:path*']
}