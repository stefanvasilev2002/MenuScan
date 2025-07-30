// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/api/restaurant'];
// Routes that are public (including the landing page)
const PUBLIC_ROUTES = ['/login', '/register', '/', '/menu'];
// Special routes that don't need ownership verification
const SPECIAL_ROUTES = ['/dashboard/menu/new', '/dashboard'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes (including landing page)
    if (PUBLIC_ROUTES.some(route => pathname === route ||
        (route !== '/' && pathname.startsWith(route)))) {
        return NextResponse.next();
    }

    // Check if route requires authentication
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        const authToken = request.cookies.get('auth_token');

        if (!authToken?.value) {
            // For API routes, return 401 instead of redirecting
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const url = new URL('/login', request.url);
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url);
        }

        try {
            const JWT_SECRET = process.env.JWT_SECRET;
            if (!JWT_SECRET) {
                console.error('JWT_SECRET is not defined');
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
                }
                return NextResponse.redirect(new URL('/login', request.url));
            }

            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jwtVerify(authToken.value, secret);

            // For API routes, just add the user ID header and continue
            if (pathname.startsWith('/api/')) {
                const requestHeaders = new Headers(request.headers);
                requestHeaders.set('x-user-id', payload.userId as string);
                return NextResponse.next({
                    request: {
                        headers: requestHeaders,
                    }
                });
            }

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

            // For restaurant-specific routes, verify ownership
            const restaurantSlugMatch = pathname.match(/\/dashboard\/([^\/]+)/);
            if (restaurantSlugMatch && !SPECIAL_ROUTES.includes(pathname)) {
                const restaurantSlug = restaurantSlugMatch[1];
                // Skip verification for the main dashboard route
                if (restaurantSlug === 'dashboard') {
                    const requestHeaders = new Headers(request.headers);
                    requestHeaders.set('x-user-id', payload.userId as string);
                    return NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        }
                    });
                }
                
                try {
                    const verifyResponse = await fetch(
                        `${request.nextUrl.origin}/api/restaurant/${restaurantSlug}/verify-ownership`,
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
                    console.error('Error verifying restaurant ownership:', error);
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
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            }
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
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};