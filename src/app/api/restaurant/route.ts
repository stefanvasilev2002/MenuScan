import { NextResponse } from 'next/server';
import { parseJson, requireUserId, route } from '@/lib/api';
import { connectToDatabase } from '@/lib/db';
import { restaurantCreateSchema } from '@/lib/validation';
import { Restaurant } from '@/models/Restaurant';

export const POST = route(async (request) => {
    const userId = await requireUserId(request);
    const { name, description } = await parseJson(request, restaurantCreateSchema);

    await connectToDatabase();
    const slug = await Restaurant.generateUniqueSlug(name);
    const restaurant = await Restaurant.create({ name, slug, userId, description, isActive: true });

    return NextResponse.json(
        {
            restaurant: {
                _id: restaurant._id,
                name: restaurant.name,
                slug: restaurant.slug,
                description: restaurant.description,
                isActive: restaurant.isActive,
                createdAt: restaurant.createdAt,
            },
        },
        { status: 201 },
    );
});
