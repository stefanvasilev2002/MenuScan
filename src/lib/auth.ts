import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { connectToDatabase } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
console.log('JWT_SECRET:', JWT_SECRET);
export interface DecodedToken {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}

export async function getCurrentUser(token: string | undefined) {
    if (!token) return null;

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

        // Connect to the database
        await connectToDatabase();

        // Find the user but exclude the password
        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            return null;
        }

        return {
            id: user._id,
            email: user.email,
            businessName: user.businessName,
            plan: user.plan
        };
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}