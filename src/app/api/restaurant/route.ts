import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { Restaurant } from '@/models/Restaurant';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { name, description } = await request.json();
        
        // Validate input
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Restaurant name is required' },
                { status: 400 }
            );
        }
        
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
        
        // Generate unique slug
        const slug = await Restaurant.generateUniqueSlug(name, user._id.toString());
        
        // Create restaurant
        const restaurant = new Restaurant({
            name: name.trim(),
            slug,
            userId: user._id,
            description: description?.trim() || '',
            isActive: true
        });
        
        await restaurant.save();
        
        return NextResponse.json({
            message: 'Restaurant created successfully',
            restaurant: {
                _id: restaurant._id,
                name: restaurant.name,
                slug: restaurant.slug,
                description: restaurant.description,
                isActive: restaurant.isActive,
                createdAt: restaurant.createdAt
            }
        });
        
    } catch (error) {
        console.error('Error creating restaurant:', error);
        
        if (error instanceof Error && error.message.includes('slug already exists')) {
            return NextResponse.json(
                { error: 'A restaurant with this name already exists' },
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 