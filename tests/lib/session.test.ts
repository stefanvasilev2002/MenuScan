import { afterEach, describe, expect, it } from 'vitest';
import { SignJWT } from 'jose';
import { MissingEnvError } from '@/lib/env';
import { signToken, verifyToken } from '@/lib/session';

const originalSecret = process.env.JWT_SECRET;

afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
});

describe('session tokens', () => {
    it('round-trips the user id', async () => {
        const token = await signToken('user-123');
        await expect(verifyToken(token)).resolves.toMatchObject({ userId: 'user-123' });
    });

    it('rejects tampered tokens', async () => {
        const token = await signToken('user-123');
        const [header, payload, signature] = token.split('.');
        const forged = Buffer.from(JSON.stringify({ userId: 'admin' })).toString('base64url');
        await expect(verifyToken(`${header}.${forged}.${signature}`)).resolves.toBeNull();
        await expect(verifyToken(`${header}.${payload}.x${signature}`)).resolves.toBeNull();
    });

    it('rejects tokens signed with a different secret', async () => {
        const token = await new SignJWT({ userId: 'user-123' })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(new TextEncoder().encode('your-secret-key'));
        await expect(verifyToken(token)).resolves.toBeNull();
    });

    it('rejects expired tokens', async () => {
        const token = await new SignJWT({ userId: 'user-123' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
            .sign(new TextEncoder().encode(process.env.JWT_SECRET));
        await expect(verifyToken(token)).resolves.toBeNull();
    });

    it('rejects tokens without a user id', async () => {
        const token = await new SignJWT({ sub: 'x' })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(new TextEncoder().encode(process.env.JWT_SECRET));
        await expect(verifyToken(token)).resolves.toBeNull();
    });

    it('fails loudly instead of using a fallback secret when JWT_SECRET is missing', async () => {
        delete process.env.JWT_SECRET;
        await expect(signToken('user-123')).rejects.toBeInstanceOf(MissingEnvError);
        await expect(verifyToken('a.b.c')).rejects.toBeInstanceOf(MissingEnvError);
    });
});
