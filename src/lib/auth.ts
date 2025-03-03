import { jwtVerify } from 'jose';
import { User } from '@/models/User';
import { connectToDatabase } from './db';

import jwt from "jsonwebtoken";

export async function getCurrentUser(token: string) {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (!payload.userId) {
            return null;
        }

        await connectToDatabase();
        const user = await User.findById(payload.userId).select('-password');

        if (!user || !user.isActive) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

export async function generateToken(userId: string) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

export async function verifyToken(token: string) {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}