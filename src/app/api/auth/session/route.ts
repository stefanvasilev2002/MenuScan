import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
    try {
        const token = (await cookies()).get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as {
                userId: string;
                email: string;
            };

            await connectToDatabase();
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                user: {
                    id: user._id,
                    email: user.email,
                    businessName: user.businessName,
                    plan: user.plan
                }
            });
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Session error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}