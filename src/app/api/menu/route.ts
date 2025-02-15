// app/api/menu/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MenuItem } from '@/models/MenuItem';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        console.log('Received body:', body); // Debug log

        // Get authentication token and verify user
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        // Validate required fields
        if (!body.menuId) {
            return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
        }

        if (!body.nameMK || !body.nameEN || !body.price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
        }

        const menuItemData = {
            menuId: body.menuId,
            nameMK: body.nameMK,
            nameEN: body.nameEN,
            descriptionMK: body.descriptionMK || '',
            descriptionEN: body.descriptionEN || '',
            price: Number(body.price),
            category: body.category,
            isAvailable: body.isAvailable ?? true,
            ingredients: body.ingredients?.filter(Boolean) || [],
            allergens: body.allergens?.filter(Boolean) || [],
            spicyLevel: Number(body.spicyLevel) || 0,
            isVegetarian: body.isVegetarian || false,
            isVegan: body.isVegan || false,
            order: body.order || 0,
            imageUrl: body.imageUrl || '',
            imagePublicId: body.imagePublicId || ''
        };

        console.log('Processed data:', menuItemData); // Debug log

        const menuItem = await MenuItem.create(menuItemData);
        console.log('Created menu item:', menuItem); // Debug log

        return NextResponse.json(menuItem, { status: 201 });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { error: 'Failed to create menu item' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const menuId = searchParams.get('menuId');

        if (!menuId) {
            return NextResponse.json(
                { error: 'Menu ID is required' },
                { status: 400 }
            );
        }

        const menuItems = await MenuItem.find({ menuId }).sort('order');
        return NextResponse.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch menu items' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();

        // Verify authentication
        const cookieStore = cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const body = await request.json();

        const menuItemData = {
            nameMK: body.nameMK,
            nameEN: body.nameEN,
            descriptionMK: body.descriptionMK || '',
            descriptionEN: body.descriptionEN || '',
            price: Number(body.price),
            category: body.category,
            isAvailable: body.isAvailable ?? true,
            ingredients: body.ingredients?.filter(Boolean) || [],
            allergens: body.allergens?.filter(Boolean) || [],
            spicyLevel: Number(body.spicyLevel) || 0,
            isVegetarian: body.isVegetarian || false,
            isVegan: body.isVegan || false,
            order: body.order || 0,
            imageUrl: body.imageUrl || '',
            imagePublicId: body.imagePublicId || ''
        };

        const menuItem = await MenuItem.findByIdAndUpdate(
            params.id,
            menuItemData,
            { new: true, runValidators: true }
        );

        if (!menuItem) {
            return NextResponse.json(
                { error: 'Menu item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(menuItem);
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json(
            { error: 'Failed to update menu item' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();

        // Verify authentication
        const cookieStore = cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const menuItem = await MenuItem.findById(params.id);
        if (!menuItem) {
            return NextResponse.json(
                { error: 'Menu item not found' },
                { status: 404 }
            );
        }

        // If there's an image, attempt to delete it from Cloudinary
        if (menuItem.imagePublicId) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload/${menuItem.imagePublicId}`, {
                    method: 'DELETE',
                });
            } catch (error) {
                console.error('Error deleting image:', error);
                // Continue with menu item deletion even if image deletion fails
            }
        }

        await MenuItem.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json(
            { error: 'Failed to delete menu item' },
            { status: 500 }
        );
    }
}