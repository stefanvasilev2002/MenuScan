import { NextResponse } from 'next/server';
import { route, unauthorized } from '@/lib/api';
import { AUTH_COOKIE, getCurrentUser } from '@/lib/auth';

export const GET = route(async (request) => {
    const user = await getCurrentUser(request.cookies.get(AUTH_COOKIE)?.value);
    if (!user) {
        throw unauthorized('Not authenticated');
    }

    return NextResponse.json({
        user: {
            id: user._id,
            email: user.email,
            businessName: user.businessName,
            plan: user.plan,
        },
    });
});
