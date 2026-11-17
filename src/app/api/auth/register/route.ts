import { NextResponse } from 'next/server';
import { conflict, parseJson, route } from '@/lib/api';
import { AUTH_COOKIE, authCookieOptions, signToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { registerSchema } from '@/lib/validation';
import { User } from '@/models/User';

export const POST = route(async (request) => {
    const { email, password, businessName } = await parseJson(request, registerSchema);

    await connectToDatabase();
    if (await User.exists({ email })) {
        throw conflict('Email already registered');
    }

    const user = await User.create({ email, password, businessName });

    const token = await signToken(String(user._id));
    const response = NextResponse.json(
        {
            user: {
                id: user._id,
                email: user.email,
                businessName: user.businessName,
            },
        },
        { status: 201 },
    );
    response.cookies.set(AUTH_COOKIE, token, authCookieOptions);
    return response;
});
