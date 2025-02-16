// app/api/menus/[id]/items/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MenuItem } from '@/models/MenuItem';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Menu } from '@/models/Menu';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await connectToDatabase();

        // Verify the menu belongs to the user
        const menu = await Menu.findOne({ _id: params.id, userId: user._id });
        if (!menu) {
            return new NextResponse('Menu not found', { status: 404 });
        }

        const menuItems = await MenuItem.find({ menuId: params.id }).sort({ order: 1 });
        return NextResponse.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await connectToDatabase();

        // Verify the menu belongs to the user
        const menu = await Menu.findOne({ _id: params.id, userId: user._id });
        if (!menu) {
            return new NextResponse('Menu not found', { status: 404 });
        }

        const body = await request.json();

        // Add menuId to the item data
        const itemData = {
            ...body,
            menuId: params.id
        };

        const menuItem = await MenuItem.create(itemData);
        return NextResponse.json(menuItem, { status: 201 });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}