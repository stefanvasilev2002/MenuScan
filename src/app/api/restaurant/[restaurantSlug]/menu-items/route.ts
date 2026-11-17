import { NextResponse } from 'next/server';
import { badRequest, caseInsensitive, conflict, parseJson, requireOwnedRestaurant, route } from '@/lib/api';
import { menuItemCreateSchema } from '@/lib/validation';
import { Category } from '@/models/Category';
import { MenuItem } from '@/models/MenuItem';

type Params = { restaurantSlug: string };

export const GET = route<Params>(async (request, { restaurantSlug }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    const items = await MenuItem.find({ restaurantId: restaurant._id }).sort({ order: 1, createdAt: 1 });
    return NextResponse.json(items);
});

export const POST = route<Params>(async (request, { restaurantSlug }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    const input = await parseJson(request, menuItemCreateSchema);

    const category = await Category.findOne({ _id: input.categoryId, restaurantId: restaurant._id });
    if (!category) {
        throw badRequest('Validation failed', { categoryId: 'Category not found' });
    }

    const duplicate = await MenuItem.findOne({
        restaurantId: restaurant._id,
        categoryId: category._id,
        name: input.name,
    }).collation(caseInsensitive);
    if (duplicate) {
        throw conflict('A menu item with this name already exists in this category');
    }

    const last = await MenuItem.findOne({ restaurantId: restaurant._id, categoryId: category._id }).sort({ order: -1 });
    const item = await MenuItem.create({
        ...input,
        order: (last?.order ?? 0) + 1,
        restaurantId: restaurant._id,
    });

    return NextResponse.json(item, { status: 201 });
});
