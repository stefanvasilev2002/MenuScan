import { connectToDatabase } from '@/lib/db';
import { MenuItem } from '@/models/MenuItem';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        console.log('Received data:', body); // Debug log

        const menuItem = await MenuItem.create(body);
        console.log('Created item:', menuItem); // Debug log

        return NextResponse.json(menuItem, { status: 201 });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { error: 'Failed to create menu item', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectToDatabase();
        const menuItems = await MenuItem.find({}).sort({ createdAt: -1 });
        return NextResponse.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch menu items', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}