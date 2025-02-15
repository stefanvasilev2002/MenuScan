// app/api/menus/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Menu } from '@/models/Menu';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        // Get the current user
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        // Get request body
        const body = await request.json();

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: 'Menu name is required' },
                { status: 400 }
            );
        }

        // Create menu data object
        const menuData = {
            name: body.name,
            userId: user._id,
            theme: body.theme || 'default',
            isActive: true,
            settings: {
                showPrices: body.settings?.showPrices ?? true,
                showDescriptions: body.settings?.showDescriptions ?? true,
                showAllergens: body.settings?.showAllergens ?? true,
                showSpicyLevel: body.settings?.showSpicyLevel ?? true,
                showDietaryInfo: body.settings?.showDietaryInfo ?? true
            },
            stats: {
                views: 0,
                scans: 0,
                lastViewed: null,
                lastScanned: null
            }
        };

        // Check user's subscription plan and menu limit
        const userMenuCount = await Menu.countDocuments({ userId: user._id });
        const menuLimit = {
            free: 1,
            basic: 3,
            premium: 10
        }[user.plan];

        if (userMenuCount >= menuLimit) {
            return NextResponse.json(
                { error: `You have reached the menu limit for your ${user.plan} plan` },
                { status: 403 }
            );
        }

        // Create the menu
        const menu = await Menu.create(menuData);

        // Generate QR code URL (you'll need to implement this)
        const qrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/menu/${menu._id}`;
        await Menu.findByIdAndUpdate(menu._id, { qrCodeUrl });

        return NextResponse.json(menu, { status: 201 });
    } catch (error) {
        console.error('Error creating menu:', error);
        return NextResponse.json(
            { error: 'Failed to create menu' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        // Get the current user
        const cookieStore = cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        // Fetch all menus for the user
        const menus = await Menu.find({ userId: user._id })
            .sort({ createdAt: -1 });

        return NextResponse.json(menus);
    } catch (error) {
        console.error('Error fetching menus:', error);
        return NextResponse.json(
            { error: 'Failed to fetch menus' },
            { status: 500 }
        );
    }
}