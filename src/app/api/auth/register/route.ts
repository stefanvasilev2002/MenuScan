import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { AUTH_COOKIE, authCookieOptions, signToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { email, password, businessName } = await request.json();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        const user = new User({ email, password, businessName });
        await user.save();

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
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
