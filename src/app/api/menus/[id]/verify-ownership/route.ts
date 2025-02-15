// app/api/menus/[id]/verify-ownership/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Menu } from '@/models/Menu';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        await connectToDatabase();

        // Get the auth token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            console.log('No auth token found');
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get the current user
        const user = await getCurrentUser(token);
        if (!user) {
            console.log('No user found for token');
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        // Check if this is a new menu creation
        if (id === 'new') {
            return NextResponse.json({ authorized: true });
        }

        // Find the menu
        const menu = await Menu.findById(id);
        if (!menu) {
            console.log('Menu not found:', id);
            return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
        }

        // Check ownership
        if (menu.userId.toString() !== user._id.toString()) {
            console.log('User ID mismatch:', {
                menuUserId: menu.userId.toString(),
                currentUserId: user._id.toString()
            });
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        return NextResponse.json({ authorized: true });
    } catch (error) {
        console.error('Error verifying menu ownership:', error);
        return NextResponse.json(
            { error: 'Failed to verify menu ownership' },
            { status: 500 }
        );
    }
}