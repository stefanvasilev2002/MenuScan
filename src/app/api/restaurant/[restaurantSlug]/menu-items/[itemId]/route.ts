import { NextResponse } from 'next/server';
import { badRequest, notFound, parseJson, requireOwnedRestaurant, route } from '@/lib/api';
import { menuItemUpdateSchema, objectIdSchema } from '@/lib/validation';
import { Category } from '@/models/Category';
import { MenuItem } from '@/models/MenuItem';

type Params = { restaurantSlug: string; itemId: string };

async function findOwnedItem(restaurantId: unknown, itemId: string) {
    if (!objectIdSchema.safeParse(itemId).success) {
        throw notFound('Menu item not found');
    }
    const item = await MenuItem.findOne({ _id: itemId, restaurantId });
    if (!item) {
        throw notFound('Menu item not found');
    }
    return item;
}

export const PUT = route<Params>(async (request, { restaurantSlug, itemId }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    const item = await findOwnedItem(restaurant._id, itemId);
    const input = await parseJson(request, menuItemUpdateSchema);

    if (input.categoryId && input.categoryId !== String(item.categoryId)) {
        const category = await Category.exists({ _id: input.categoryId, restaurantId: restaurant._id });
        if (!category) {
            throw badRequest('Validation failed', { categoryId: 'Category not found' });
        }
    }

    item.set(input);
    await item.save();
    return NextResponse.json(item);
});

export const DELETE = route<Params>(async (request, { restaurantSlug, itemId }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    const item = await findOwnedItem(restaurant._id, itemId);
    await item.deleteOne();
    return NextResponse.json({ success: true });
});
