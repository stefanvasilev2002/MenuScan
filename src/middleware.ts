import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const authToken = request.cookies.get('auth_token');

        if (!authToken?.value) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jwtVerify(authToken.value, secret);

            // If accessing a specific menu, verify ownership
            const menuIdMatch = request.nextUrl.pathname.match(/\/menu\/([^\/]+)/);
            if (menuIdMatch) {
                const menuId = menuIdMatch[1];
                // You'll need to implement this check in your Menu model
                const menuBelongsToUser = await checkMenuOwnership(menuId, payload.userId);

                if (!menuBelongsToUser) {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }

            return NextResponse.next();
        } catch (error) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*']
};