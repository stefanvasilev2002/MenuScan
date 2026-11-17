import { describe, expect, it } from 'vitest';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as logout } from '@/app/api/auth/logout/route';
import { GET as session } from '@/app/api/auth/session/route';
import { verifyToken } from '@/lib/session';
import { User } from '@/models/User';
import { setupTestDatabase } from '../helpers/db';
import { call } from '../helpers/http';
import { makeTestPassword } from '../helpers/fixtures';

setupTestDatabase();

const wrongPassword = makeTestPassword();
const credentials = { email: 'chef@example.com', password: makeTestPassword(), businessName: 'Chef Co' };

function tokenFrom(headers: Headers): string {
    const match = /auth_token=([^;]+)/.exec(headers.get('set-cookie') ?? '');
    if (!match) {
        throw new Error('auth cookie not set');
    }
    return match[1];
}

describe('POST /api/auth/register', () => {
    it('creates the user, hashes the password and sets an http-only session cookie', async () => {
        const res = await call(register, 'POST', { body: credentials });

        expect(res.status).toBe(201);
        expect(res.body.user).toMatchObject({ email: 'chef@example.com', businessName: 'Chef Co' });
        expect(res.headers.get('set-cookie')).toMatch(/HttpOnly/i);

        const stored = await User.findOne({ email: 'chef@example.com' });
        expect(stored?.password).not.toBe(credentials.password);
        await expect(verifyToken(tokenFrom(res.headers))).resolves.toMatchObject({ userId: String(stored?._id) });
    });

    it('rejects duplicate emails regardless of case', async () => {
        await call(register, 'POST', { body: credentials });
        const res = await call(register, 'POST', { body: { ...credentials, email: 'CHEF@example.com' } });
        expect(res.status).toBe(409);
    });

    it('returns field errors for invalid input', async () => {
        const res = await call(register, 'POST', { body: { email: 'bad', password: 'weak', businessName: '' } });
        expect(res.status).toBe(400);
        expect(Object.keys(res.body.details)).toEqual(expect.arrayContaining(['email', 'password', 'businessName']));
    });

    it('rejects malformed JSON with 400', async () => {
        const res = await call(register, 'POST', { body: '{not json' });
        expect(res.status).toBe(400);
    });
});

describe('POST /api/auth/login', () => {
    it('logs in with the right password', async () => {
        await call(register, 'POST', { body: credentials });
        const res = await call(login, 'POST', { body: { email: 'Chef@Example.com', password: credentials.password } });
        expect(res.status).toBe(200);
        expect(tokenFrom(res.headers)).toBeTruthy();
    });

    it('returns the same 401 for a wrong password and an unknown email', async () => {
        await call(register, 'POST', { body: credentials });
        const wrongPasswordRes = await call(login, 'POST', { body: { email: credentials.email, password: wrongPassword } });
        const unknownEmail = await call(login, 'POST', { body: { email: 'nobody@example.com', password: wrongPassword } });
        expect(wrongPasswordRes.status).toBe(401);
        expect(unknownEmail.status).toBe(401);
        expect(wrongPasswordRes.body).toEqual(unknownEmail.body);
    });

    it('rejects deactivated accounts', async () => {
        await call(register, 'POST', { body: credentials });
        await User.updateOne({ email: credentials.email }, { isActive: false });
        const res = await call(login, 'POST', { body: { email: credentials.email, password: credentials.password } });
        expect(res.status).toBe(401);
    });
});

describe('GET /api/auth/session', () => {
    it('returns 401 without a cookie', async () => {
        expect((await call(session, 'GET')).status).toBe(401);
    });

    it('returns the current user without the password hash', async () => {
        const reg = await call(register, 'POST', { body: credentials });
        const res = await call(session, 'GET', { token: tokenFrom(reg.headers) });
        expect(res.status).toBe(200);
        expect(res.body.user).toMatchObject({ email: credentials.email });
        expect(JSON.stringify(res.body)).not.toContain('password');
    });
});

describe('POST /api/auth/logout', () => {
    it('clears the session cookie', async () => {
        const res = await call(logout, 'POST');
        expect(res.status).toBe(200);
        expect(res.headers.get('set-cookie')).toMatch(/auth_token=;/);
    });
});
