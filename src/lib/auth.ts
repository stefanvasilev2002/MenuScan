import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { User } from '@/models/User';
import { connectToDatabase } from './db';
import { getJwtSecret } from './env';

export const AUTH_COOKIE = 'auth_token';
export const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface AuthTokenPayload extends JWTPayload {
    userId: string;
}

export async function signToken(userId: string): Promise<string> {
    return new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
        .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });
        if (typeof payload.userId !== 'string' || payload.userId === '') {
            return null;
        }
        return payload as AuthTokenPayload;
    } catch {
        return null;
    }
}

export async function getCurrentUser(token: string | undefined) {
    if (!token) {
        return null;
    }
    const payload = await verifyToken(token);
    if (!payload) {
        return null;
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId).select('-password');
    if (!user || !user.isActive) {
        return null;
    }
    return user;
}

export const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
};
