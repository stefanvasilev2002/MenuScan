import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MenuItem } from '@/models/MenuItem';

export async function POST(request: Request) {
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

        const menuItem = await MenuItem.create(menuItemData);
        return NextResponse.json(menuItem, { status: 201 });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { error: 'Failed to create menu item' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectToDatabase();
        const menuItems = await MenuItem.find().sort('order');
        return NextResponse.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch menu items' },
            { status: 500 }
        );
    }
}