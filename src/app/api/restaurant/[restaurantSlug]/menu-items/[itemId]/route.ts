import { NextRequest, NextResponse } from 'next/server';
import { Restaurant } from '@/models/Restaurant';
import { MenuItem } from '@/models/MenuItem';
import { Category } from '@/models/Category';
import { connectToDatabase } from '@/lib/db';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantSlug: string; itemId: string }> }
) {
    try {
        const { restaurantSlug, itemId } = await params;
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

        // Find the menu item and verify it belongs to this restaurant
        const menuItem = await MenuItem.findOne({
            _id: itemId,
            restaurantId: restaurant._id
        });

        if (!menuItem) {
            return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
        }

        // Update menu item
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            itemId,
            {
                name: body.name?.trim(),
                description: body.description?.trim(),
                price: body.price,
                categoryId: body.categoryId,
                imageUrl: body.imageUrl,
                imagePublicId: body.imagePublicId,
                isAvailable: body.isAvailable,
                isVegetarian: body.isVegetarian,
                isVegan: body.isVegan,
                isSpicy: body.isSpicy,
                allergens: body.allergens,
                ingredients: body.ingredients,
                preparationTime: body.preparationTime,
                order: body.order
            },
            { new: true, runValidators: true }
        );

        return NextResponse.json(updatedMenuItem);
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantSlug: string; itemId: string }> }
) {
    try {
        const { restaurantSlug, itemId } = await params;
        
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

        // Find the menu item and verify it belongs to this restaurant
        const menuItem = await MenuItem.findOne({
            _id: itemId,
            restaurantId: restaurant._id
        });

        if (!menuItem) {
            return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
        }

        // Delete the menu item
        await MenuItem.findByIdAndDelete(itemId);

        return NextResponse.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 