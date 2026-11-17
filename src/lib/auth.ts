import { User } from '@/models/User';
import { connectToDatabase } from './db';
import { verifyToken } from './session';

export { AUTH_COOKIE, TOKEN_TTL_SECONDS, authCookieOptions, signToken, verifyToken } from './session';
export type { AuthTokenPayload } from './session';

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
