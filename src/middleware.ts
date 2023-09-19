import { NextRequest, NextResponse } from 'next/server';
import { KeyLike, jwtVerify } from 'jose';

const freeCheckSources = ['/user/login, /user/register', '/user/email', '/user/reset', '/user/resetEmail', '/user/forget', '/about', '/']

export async function middleware(request: NextRequest) {
    const jwt: any = request.cookies.get('userToken')?.value

    try {
        if(jwt === undefined) {
            return NextResponse.redirect(new URL('/user/login', request.url))
        }

        const { payload } = await jwtVerify(jwt, new TextEncoder().encode(process.env.NEXTAUTH_SECRET as string))

        return NextResponse.next()        
    } catch (error) {
        console.log(error, jwt)
        return NextResponse.redirect(new URL('/user/login', request.url))
    }


}

export const config = {
    matcher: ['/user/account/:path*', '/home', '/admin/:path*', '/courses/:path*']
}