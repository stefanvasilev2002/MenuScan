import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE, getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const token = (await cookies()).get(AUTH_COOKIE)?.value;
        const user = await getCurrentUser(token);

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                id: user._id,
                email: user.email,
                businessName: user.businessName,
                plan: user.plan,
            },
        });
    } catch (error) {
        console.error('Session error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
