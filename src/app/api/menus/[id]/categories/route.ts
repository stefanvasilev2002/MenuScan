// app/api/menus/[id]/categories/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { Menu } from '@/models/Menu';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        // Check authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const user = token ? await getCurrentUser(token) : null;

        // Verify the menu exists
        const menu = await Menu.findById(params.id);
        if (!menu) {
            return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
        }

        // If authenticated and menu belongs to user, verify ownership
        if (user && menu.userId.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch categories for the menu
        const categories = await Category.find({
            menuId: params.id,
            isVisible: true
        }).sort({ order: 1 });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// Add POST endpoint for creating categories
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        await connectToDatabase();

        // Verify menu ownership
        const menu = await Menu.findOne({ _id: params.id, userId: user._id });
        if (!menu) {
            return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
        }

        const body = await request.json();

        // Validate required fields
        if (!body.nameMK || !body.nameEN) {
            return NextResponse.json(
                { error: 'Name is required in both languages' },
                { status: 400 }
            );
        }

        // Create slug from nameMK
        const slug = body.nameMK
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');

        // Get current highest order
        const highestOrder = await Category.findOne({ menuId: params.id })
            .sort({ order: -1 })
            .select('order');

        const newOrder = (highestOrder?.order || 0) + 1;

        const categoryData = {
            ...body,
            menuId: params.id,
            slug,
            order: newOrder
        };

        const category = await Category.create(categoryData);
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}