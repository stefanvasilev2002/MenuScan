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
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();
        const body = await request.json();

        const menuItem = await MenuItem.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });

        if (!menuItem) {
            return NextResponse.json(
                { error: 'Menu item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(menuItem);
    } catch (error) {
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