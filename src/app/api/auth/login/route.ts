import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
console.log('JWT_SECRET:', JWT_SECRET);

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { email, password } = body;

        console.log('Login attempt for email:', email);

        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('User not found');
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isValidPassword = await user.comparePassword(password);
        console.log('Password valid:', isValidPassword);

        if (!isValidPassword) {
            console.log('Invalid password');
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Create the response
        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                businessName: user.businessName
            }
        });

        // Set the cookie in the response
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
        });

        console.log('Login successful, returning response');
        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}