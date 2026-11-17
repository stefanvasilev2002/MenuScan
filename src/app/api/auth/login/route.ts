import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { AUTH_COOKIE, authCookieOptions, signToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { email, password } = await request.json();

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const token = await signToken(String(user._id));
        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                businessName: user.businessName,
            },
        });
        response.cookies.set(AUTH_COOKIE, token, authCookieOptions);
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
