import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE, verifyToken } from '@/lib/session';

const PROTECTED_PAGE_PREFIXES = ['/dashboard'];
const PROTECTED_API_PREFIXES = ['/api/restaurant', '/api/upload'];

function matches(pathname: string, prefixes: string[]) {
    return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    return token ? (await verifyToken(token)) !== null : false;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isApi = matches(pathname, PROTECTED_API_PREFIXES);

    if (!isApi && !matches(pathname, PROTECTED_PAGE_PREFIXES)) {
        return NextResponse.next();
    }

    let authenticated: boolean;
    try {
        authenticated = await hasValidSession(request);
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (authenticated) {
        return NextResponse.next();
    }

    if (isApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    const response = NextResponse.redirect(loginUrl);
    if (request.cookies.has(AUTH_COOKIE)) {
        response.cookies.delete(AUTH_COOKIE);
    }
    return response;
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/restaurant/:path*', '/api/upload/:path*'],
};
