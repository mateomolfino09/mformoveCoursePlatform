import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const freeCheckSources = ['/login', '/register', '/email', '/reset', '/resetEmail', '/forget', '/about', '/'];

export async function middleware(request: NextRequest) {
    const jwt = request.cookies.get('userToken')?.value;
    const response = NextResponse.next();
    
    // Deshabilitar caché en todas las rutas
    //response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    try {
        // Verifica si el token JWT no existe y redirige a login
        if (jwt === undefined) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Redirecciones específicas según las rutas
        if (request.nextUrl.pathname === '/products' || request.nextUrl.pathname === '/payment/back') {
            return NextResponse.redirect(new URL('/select-plan', request.url));
        }

        // Verificar el JWT
        const { payload } = await jwtVerify(jwt, new TextEncoder().encode(process.env.NEXTAUTH_SECRET as string));

        return response;
    } catch (error) {
        // Si hay un error en la verificación, redirige a login
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

// Aplicar el middleware a todas las rutas
export const config = {
    matcher: ['/account/:path*', '/admin/:path*', '/products/:path*', '/payment/:path*']
};
