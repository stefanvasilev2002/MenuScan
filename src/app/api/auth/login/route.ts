import { NextResponse } from 'next/server';
import { parseJson, route, unauthorized } from '@/lib/api';
import { AUTH_COOKIE, authCookieOptions, signToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { loginSchema } from '@/lib/validation';
import { User } from '@/models/User';

export const POST = route(async (request) => {
    const { email, password } = await parseJson(request, loginSchema);

    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user || !user.isActive || !(await user.comparePassword(password))) {
        throw unauthorized('Invalid email or password');
    }

    const token = await signToken(String(user._id));
    const response = NextResponse.json({
        user: {
            id: user._id,
            email: user.email,
            businessName: user.businessName,
        },
    });
    response.cookies.set(AUTH_COOKIE, token, authCookieOptions);
    return response;
});
