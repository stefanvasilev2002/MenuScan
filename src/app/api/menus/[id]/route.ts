// app/api/menus/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Menu } from '@/models/Menu';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        await connectToDatabase();

        const menu = await Menu.findById(id);
        console.log('Menu:', menu);
        console.log('Menu ID:', id);
        if (!menu) {
            console.error('Menu not found:', id);
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