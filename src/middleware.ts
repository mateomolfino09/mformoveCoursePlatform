import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Rutas que no requieren autenticación
const freeCheckSources = ['/login', '/register', '/email', '/reset', '/resetEmail', '/forget', '/about', '/'];
// Rutas de onboarding que requieren autenticación pero no deben ser bloqueadas por el middleware
const onboardingPaths = ['/onboarding'];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const jwt = request.cookies.get('userToken')?.value;
    const response = NextResponse.next();
    
    // Permitir acceso a rutas de onboarding sin verificación adicional
    if (onboardingPaths.some(path => pathname.startsWith(path))) {
        return response;
    }

    // Permitir acceso a rutas públicas
    if (freeCheckSources.some(path => pathname === path || pathname.startsWith(path + '/'))) {
        return response;
    }
    
    try {
        // Verifica si el token JWT no existe y redirige a login
        if (jwt === undefined) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Redirecciones específicas según las rutas
        if (pathname === '/payment/back') {
            return NextResponse.redirect(new URL('/mentorship', request.url));
        }

        // Verificar el JWT
        const { payload } = await jwtVerify(jwt, new TextEncoder().encode(process.env.NEXTAUTH_SECRET as string));

        return response;
    } catch (error) {
        // Si hay un error en la verificación, redirige a login
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

// Aplicar el middleware a rutas protegidas (excluyendo onboarding que se maneja arriba)
export const config = {
    matcher: [
        '/account/:path*', 
        '/admin/:path*', 
        '/products/:path*', 
        '/payment/:path*',
        '/home/:path*',
        '/onboarding/:path*' // Incluido para permitir acceso pero sin bloquear
    ]
};
