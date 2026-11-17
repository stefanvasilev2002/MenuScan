import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { getJwtSecret, MissingEnvError } from './env';

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
    const secret = getJwtSecret();
    try {
        const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
        if (typeof payload.userId !== 'string' || payload.userId === '') {
            return null;
        }
        return payload as AuthTokenPayload;
    } catch (error) {
        if (error instanceof MissingEnvError) {
            throw error;
        }
        return null;
    }
}

export const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
};
