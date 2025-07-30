import { NextRequest, NextResponse } from 'next/server';
import { Restaurant } from '@/models/Restaurant';
import { MenuItem } from '@/models/MenuItem';
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

        // Fetch menu items for this restaurant
        const menuItems = await MenuItem.find({ 
            restaurantId: restaurant._id 
        }).sort({ order: 1, createdAt: 1 });

        return NextResponse.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
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
                { error: 'Menu item name is required' },
                { status: 400 }
            );
        }

        if (!body.price || body.price <= 0) {
            return NextResponse.json(
                { error: 'Valid price is required' },
                { status: 400 }
            );
        }

        if (!body.categoryId) {
            return NextResponse.json(
                { error: 'Category is required' },
                { status: 400 }
            );
        }

        // Verify category exists and belongs to this restaurant
        const category = await Category.findOne({
            _id: body.categoryId,
            restaurantId: restaurant._id
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Invalid category' },
                { status: 400 }
            );
        }

        // Check if menu item name already exists in this category
        const existingItem = await MenuItem.findOne({
            restaurantId: restaurant._id,
            categoryId: body.categoryId,
            name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') }
        });

        if (existingItem) {
            return NextResponse.json(
                { error: 'A menu item with this name already exists in this category' },
                { status: 400 }
            );
        }

        // Get the highest order number for this restaurant
        const lastItem = await MenuItem.findOne({ 
            restaurantId: restaurant._id 
        }).sort({ order: -1 });
        
        const newOrder = (lastItem?.order || 0) + 1;

        // Create new menu item
        const menuItem = new MenuItem({
            name: body.name.trim(),
            description: body.description?.trim() || '',
            price: body.price,
            categoryId: body.categoryId,
            imageUrl: body.imageUrl,
            imagePublicId: body.imagePublicId,
            isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
            isVegetarian: body.isVegetarian || false,
            isVegan: body.isVegan || false,
            isSpicy: body.isSpicy || false,
            allergens: body.allergens || [],
            ingredients: body.ingredients || [],
            preparationTime: body.preparationTime,
            order: newOrder,
            restaurantId: restaurant._id
        });

        await menuItem.save();

        return NextResponse.json(menuItem, { status: 201 });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 