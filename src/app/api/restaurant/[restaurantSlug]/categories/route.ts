import { NextResponse } from 'next/server';
import { caseInsensitive, conflict, parseJson, requireOwnedRestaurant, route } from '@/lib/api';
import { assertValidParent } from '@/lib/categories';
import { categoryCreateSchema } from '@/lib/validation';
import { Category } from '@/models/Category';

type Params = { restaurantSlug: string };

export const GET = route<Params>(async (request, { restaurantSlug }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    const categories = await Category.find({ restaurantId: restaurant._id }).sort({ order: 1, createdAt: 1 });
    return NextResponse.json(categories);
});

export const POST = route<Params>(async (request, { restaurantSlug }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    const input = await parseJson(request, categoryCreateSchema);

    const duplicate = await Category.findOne({ restaurantId: restaurant._id, name: input.name }).collation(caseInsensitive);
    if (duplicate) {
        throw conflict('A category with this name already exists');
    }

    await assertValidParent(restaurant._id, null, input.parentId);

    const last = await Category.findOne({ restaurantId: restaurant._id, parentId: input.parentId }).sort({ order: -1 });
    const category = await Category.create({
        ...input,
        order: (last?.order ?? 0) + 1,
        restaurantId: restaurant._id,
    });

    return NextResponse.json(category, { status: 201 });
});
