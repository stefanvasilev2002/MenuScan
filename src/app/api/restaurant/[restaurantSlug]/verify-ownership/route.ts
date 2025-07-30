import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { Restaurant } from '@/models/Restaurant';
import { connectToDatabase } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        
        // Get user from token
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const user = await getCurrentUser(token);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        await connectToDatabase();
        
        // Find restaurant and verify ownership
        const restaurant = await Restaurant.findOne({
            slug: restaurantSlug,
            userId: user._id
        });
        
        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }
        
        return NextResponse.json({ verified: true });
    } catch (error) {
        console.error('Error verifying restaurant ownership:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 