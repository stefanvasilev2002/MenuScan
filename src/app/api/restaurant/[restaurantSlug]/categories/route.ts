import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { Restaurant } from '@/models/Restaurant';
import { Category } from '@/models/Category';
import { connectToDatabase } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        
        // Get user from headers (set by middleware)
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Verify restaurant ownership
        const restaurant = await Restaurant.findOne({ 
            slug: restaurantSlug, 
            userId 
        });

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // Fetch categories for this restaurant
        const categories = await Category.find({ 
            restaurantId: restaurant._id 
        }).sort({ order: 1, createdAt: 1 });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        const body = await request.json();
        
        // Get user from headers (set by middleware)
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Verify restaurant ownership
        const restaurant = await Restaurant.findOne({ 
            slug: restaurantSlug, 
            userId 
        });

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // Validate required fields
        if (!body.name || body.name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        // Check if category name already exists for this restaurant
        const existingCategory = await Category.findOne({
            restaurantId: restaurant._id,
            name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') }
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: 'A category with this name already exists' },
                { status: 400 }
            );
        }

        // Get the highest order number for this restaurant
        const lastCategory = await Category.findOne({ 
            restaurantId: restaurant._id 
        }).sort({ order: -1 });
        
        const newOrder = (lastCategory?.order || 0) + 1;

        // Create new category
        const category = new Category({
            name: body.name.trim(),
            description: body.description?.trim() || '',
            icon: body.icon || '🍽️',
            color: body.color || '#3B82F6',
            isVisible: body.isVisible !== undefined ? body.isVisible : true,
            order: newOrder,
            restaurantId: restaurant._id
        });

        await category.save();

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 