import { NextRequest, NextResponse } from 'next/server';
import { Restaurant } from '@/models/Restaurant';
import { Category } from '@/models/Category';
import { MenuItem } from '@/models/MenuItem';
import { connectToDatabase } from '@/lib/db';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantSlug: string; categoryId: string }> }
) {
    try {
        const { restaurantSlug, categoryId } = await params;
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

        // Find the category and verify it belongs to this restaurant
        const category = await Category.findOne({
            _id: categoryId,
            restaurantId: restaurant._id
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Update category
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            {
                name: body.name?.trim(),
                description: body.description?.trim(),
                icon: body.icon,
                color: body.color,
                isVisible: body.isVisible,
                order: body.order
            },
            { new: true, runValidators: true }
        );

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantSlug: string; categoryId: string }> }
) {
    try {
        const { restaurantSlug, categoryId } = await params;
        
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

        // Find the category and verify it belongs to this restaurant
        const category = await Category.findOne({
            _id: categoryId,
            restaurantId: restaurant._id
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Delete all menu items in this category
        await MenuItem.deleteMany({ categoryId });

        // Delete the category
        await Category.findByIdAndDelete(categoryId);

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 