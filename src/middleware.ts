// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];
// Routes that are public
const PUBLIC_ROUTES = ['/login', '/register'];
// Special routes that don't need ownership verification
const SPECIAL_ROUTES = ['/dashboard/menu/new'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check if route requires authentication
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        const authToken = request.cookies.get('auth_token');

        if (!authToken?.value) {
            const url = new URL('/login', request.url);
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url);
        }

        try {
            const JWT_SECRET = process.env.JWT_SECRET;
            if (!JWT_SECRET) {
                console.error('JWT_SECRET is not defined');
                return NextResponse.redirect(new URL('/login', request.url));
            }

            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jwtVerify(authToken.value, secret);

            // Skip ownership verification for special routes
            if (SPECIAL_ROUTES.some(route => pathname.startsWith(route))) {
                const requestHeaders = new Headers(request.headers);
                requestHeaders.set('x-user-id', payload.userId as string);
                return NextResponse.next({
                    request: {
                        headers: requestHeaders,
                    }
                });
            }

            // For menu-specific routes, verify ownership
            const menuIdMatch = pathname.match(/\/dashboard\/menu\/([^\/]+)/);
            if (menuIdMatch && !SPECIAL_ROUTES.includes(pathname)) {
                const menuId = menuIdMatch[1];
                try {
                    const verifyResponse = await fetch(
                        `${request.nextUrl.origin}/api/menus/${menuId}/verify-ownership`,
                        {
                            headers: {
                                Cookie: `auth_token=${authToken.value}`
                            }
                        }
                    );

                    if (!verifyResponse.ok) {
                        return NextResponse.redirect(new URL('/dashboard', request.url));
                    }
                } catch (error) {
                    console.error('Error verifying menu ownership:', error);
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }

            // Add user ID to headers
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', payload.userId as string);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                }
            });
        } catch (error) {
            console.error('Token verification failed:', error);
            const url = new URL('/login', request.url);
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};