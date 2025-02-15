
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MenuItem } from '@/models/MenuItem';

export async function PUT(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { menuId, items } = body;

        // Update each item's order in parallel
        await Promise.all(
            items.map(({ id, order }) =>
                MenuItem.findByIdAndUpdate(id, { order })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering menu items:', error);
        return NextResponse.json(
            { error: 'Failed to reorder items' },
            { status: 500 }
        );
    }
}
export async function GET() {
    try {
        await connectToDatabase();
        const menuItems = await MenuItem.find().sort('order');
        // Ensure we always return an array
        return NextResponse.json(menuItems || []);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        // Return empty array on error
        return NextResponse.json([], { status: 500 });
    }
}