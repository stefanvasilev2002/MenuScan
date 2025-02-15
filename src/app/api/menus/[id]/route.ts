// app/api/menus/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Menu } from '@/models/Menu';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        await connectToDatabase();

        const menu = await Menu.findById(id);
        if (!menu) {
            return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
        }

        // Only return necessary public information
        return NextResponse.json({
            id: menu._id,
            name: menu.name,
            theme: menu.theme,
            settings: menu.settings
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        return NextResponse.json(
            { error: 'Failed to fetch menu' },
            { status: 500 }
        );
    }
}