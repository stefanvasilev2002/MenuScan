import { connectToDatabase } from '@/lib/db';
import { MenuItem } from '@/models/MenuItem';
import { NextResponse } from 'next/server';
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();
        const menuItem = await MenuItem.findById(params.id);

        if (!menuItem) {
            return NextResponse.json(
                { error: 'Menu item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(menuItem);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch menu item' },
            { status: 500 }
        );
    }
}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
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
            order: body.order || 0
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

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();
        const menuItem = await MenuItem.findByIdAndDelete(params.id);

        if (!menuItem) {
            return NextResponse.json(
                { error: 'Menu item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Menu item deleted' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete menu item' },
            { status: 500 }
        );
    }
}