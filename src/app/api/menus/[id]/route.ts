// app/api/menus/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Menu } from '@/models/Menu';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();

        await connectToDatabase();

        const menu = await Menu.findOne({ _id: id, userId: user._id });
        if (!menu) {
            return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
        }

        const updatedMenu = await Menu.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        return NextResponse.json(updatedMenu);
    } catch (error) {
        console.error('Error updating menu:', error);
        return NextResponse.json(
            { error: 'Failed to update menu' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const { id } = params;
        await connectToDatabase();

        const menu = await Menu.findOne({ _id: id, userId: user._id });
        if (!menu) {
            return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
        }

        await Menu.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Menu deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu:', error);
        return NextResponse.json(
            { error: 'Failed to delete menu' },
            { status: 500 }
        );
    }
}
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        await connectToDatabase();

        // Try to get authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const user = token ? await getCurrentUser(token) : null;

        const menu = await Menu.findById(id);
        if (!menu) {
            return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
        }

        // If authenticated and menu belongs to user, return full menu data
        if (user && menu.userId.toString() === user._id.toString()) {
            return NextResponse.json(menu);
        }

        // For public access or different user, return limited data
        return NextResponse.json({
            id: menu._id,
            name: menu.name,
            theme: menu.theme,
            settings: menu.settings,
            isActive: menu.isActive
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        return NextResponse.json(
            { error: 'Failed to fetch menu' },
            { status: 500 }
        );
    }
}